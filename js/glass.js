/* ------------------------------------------------------------------
   Liquid glass: real refraction for elements marked [data-glass].

   Each glass element gets an SVG filter holding a displacement map shaped
   like its own rounded rectangle. Near the rim, the map pulls pixels in
   from further inside, so whatever sits behind the glass bends at the
   edges the way it would through a thick lens, while the middle stays
   clear and readable. The filter is applied with backdrop-filter: url().

   Only Chromium renders SVG filters in backdrop-filter. Everywhere else
   (and with reduced transparency) this does nothing and the CSS frosted
   glass in styles.css is what people see.

   Per-element tuning, all optional:
     data-glass-bezel="12"   width of the refracting rim, px
     data-glass-scale="24"   strength of the bend, px
     data-glass-blur="2"     frost behind the glass, px
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  const brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
  const chromium = brands.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-transparency: reduce)').matches;
  // Phones and tablets keep the frosted glass but skip refraction: SVG
  // backdrop filters are costly on mobile GPUs and drain battery while scrolling.
  const touch = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  if (!chromium || reduced || touch) return;

  document.documentElement.classList.add('lg-refract');

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  const defs = document.createElementNS(NS, 'defs');
  svg.append(defs);

  const maps = new Map();   // "w×h×r×bezel" → data URL, so resizing back and forth is free
  let uid = 0;

  /* Displacement map for a w×h rounded rect of corner radius r.
     Red = horizontal shift, green = vertical, 128 = none. */
  function lensMap(w, h, r, bezel) {
    const key = `${w}x${h}x${r}x${bezel}`;
    if (maps.has(key)) return maps.get(key);

    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    const d = img.data;
    const hx = w / 2, hy = h / 2;
    const ix = Math.max(hx - r, 0), iy = Math.max(hy - r, 0);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = x + 0.5 - hx, py = y + 0.5 - hy;
        const qx = Math.abs(px) - ix, qy = Math.abs(py) - iy;
        // signed distance to the rounded rect (negative inside) and its outward normal
        let dist, nx, ny;
        if (qx > 0 && qy > 0) {
          const len = Math.hypot(qx, qy) || 1;
          dist = len - r;
          nx = (qx / len) * Math.sign(px);
          ny = (qy / len) * Math.sign(py);
        } else if (qx > qy) {
          dist = qx - r; nx = Math.sign(px); ny = 0;
        } else {
          dist = qy - r; nx = 0; ny = Math.sign(py);
        }
        const inside = -dist;                     // depth from the rim
        let m = 0;
        if (inside < bezel) {
          // convex-squircle profile: steep at the rim, flat by the inner edge
          const t = 1 - Math.max(inside, 0) / bezel;
          m = t * t * (3 - 2 * t);
        }
        const i = (y * w + x) * 4;
        // sample from further inside: shift against the outward normal
        d[i]     = 128 - nx * m * 127;
        d[i + 1] = 128 - ny * m * 127;
        d[i + 2] = 128;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const url = c.toDataURL();
    if (maps.size > 60) maps.delete(maps.keys().next().value);
    maps.set(key, url);
    return url;
  }

  function radiusOf(el, w, h) {
    const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    return Math.min(r, w / 2, h / 2);
  }

  function attach(el) {
    if (el._glass) return;
    const id = 'lg-' + (++uid);
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    filter.setAttribute('width', '100%');
    filter.setAttribute('height', '100%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    const feImg = document.createElementNS(NS, 'feImage');
    feImg.setAttribute('x', '0');
    feImg.setAttribute('y', '0');
    feImg.setAttribute('preserveAspectRatio', 'none');
    feImg.setAttribute('result', 'map');
    const disp = document.createElementNS(NS, 'feDisplacementMap');
    disp.setAttribute('in', 'SourceGraphic');
    disp.setAttribute('in2', 'map');
    disp.setAttribute('xChannelSelector', 'R');
    disp.setAttribute('yChannelSelector', 'G');
    filter.append(feImg, disp);
    defs.append(filter);

    const bezel = +el.dataset.glassBezel || 12;
    const scale = +el.dataset.glassScale || 24;
    const blur  = el.dataset.glassBlur != null ? +el.dataset.glassBlur : 2;

    let last = '';
    const update = () => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      const r = Math.round(radiusOf(el, w, h));
      const b = Math.min(bezel, Math.floor(Math.min(w, h) / 2));
      const key = `${w}x${h}x${r}x${b}`;
      if (key === last) return;
      last = key;
      feImg.setAttribute('width', w);
      feImg.setAttribute('height', h);
      feImg.setAttribute('href', lensMap(w, h, r, b));
      disp.setAttribute('scale', scale);
      el.style.backdropFilter = `url(#${id}) blur(${blur}px) saturate(1.6)`;
    };

    // ResizeObserver already delivers at most once per frame.
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(el);
    el._glass = { update };
    update();
  }

  function scan(root = document) {
    root.querySelectorAll('[data-glass]').forEach(attach);
  }

  // Run after main.js has rendered (it also listens for DOMContentLoaded and
  // is loaded first), and pick up glass that shows up later, like the
  // highlight lens, which main.js creates on the fly.
  document.addEventListener('DOMContentLoaded', () => {
    document.body.append(svg);
    scan();
    new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.matches('[data-glass]')) attach(n);
        scan(n);
      });
    }).observe(document.body, { childList: true, subtree: true });
  });

  window.LiquidGlass = { scan, attach };
})();
