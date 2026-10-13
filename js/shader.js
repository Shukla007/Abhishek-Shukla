/* ------------------------------------------------------------------
   Animated background: a slow, soft mesh gradient drawn by a WebGL
   fragment shader. It's what the glass surfaces blur and bend, so the
   material actually reads as glass.

   Kept cheap on purpose: it renders at a fraction of screen resolution
   (it's all soft gradients, so upscaling is invisible), caps the frame
   rate, stops while the tab is hidden, and draws a single still frame
   for prefers-reduced-motion. Without WebGL, the CSS fallback in
   styles.css (html.no-shader) takes over.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  const canvas = document.getElementById('bg-shader');
  if (!canvas) return;

  const root = document.documentElement;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const still  = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    preserveDrawingBuffer: false, powerPreference: 'low-power',
  });
  if (!gl) { root.classList.add('no-shader'); return; }

  const VERT = `
    attribute vec2 p;
    void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

  const FRAG = `
    precision mediump float;
    uniform vec2  uRes;
    uniform float uTime;
    uniform float uDark;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
                 mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
      return v;
    }
    // soft blob: 1 at the centre, fading out over r
    float blob(vec2 uv, vec2 c, float r) { vec2 d = uv - c; return exp(-dot(d, d) / (r * r)); }

    void main() {
      vec2 uv = gl_FragCoord.xy / uRes;
      float aspect = uRes.x / uRes.y;
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = uTime;

      // flowing warp, so blobs smear like ink instead of sliding like discs
      vec2 w = vec2(fbm(p * 1.6 + vec2(t * 0.05, -t * 0.04)),
                    fbm(p * 1.6 + vec2(-t * 0.03, t * 0.06) + 7.3));
      p += (w - 0.5) * 0.45;

      vec2 c1 = vec2(aspect * (0.20 + 0.12 * sin(t * 0.21)),        0.85 + 0.08 * cos(t * 0.17));
      vec2 c2 = vec2(aspect * (0.82 + 0.10 * cos(t * 0.19)),        0.70 + 0.12 * sin(t * 0.23));
      vec2 c3 = vec2(aspect * (0.55 + 0.20 * sin(t * 0.13 + 1.0)),  0.25 + 0.10 * cos(t * 0.29));
      vec2 c4 = vec2(aspect * (0.10 + 0.10 * cos(t * 0.11 + 2.0)),  0.20 + 0.12 * sin(t * 0.15));

      // light palette: pastel aurora on near-white
      vec3 lb = vec3(0.985, 0.985, 0.99);
      vec3 l1 = vec3(0.78, 0.80, 1.00);   // lavender
      vec3 l2 = vec3(1.00, 0.83, 0.70);   // peach
      vec3 l3 = vec3(0.72, 0.94, 0.85);   // mint
      vec3 l4 = vec3(0.70, 0.86, 1.00);   // sky
      // dark palette: deep glows on ink
      vec3 db = vec3(0.043, 0.043, 0.047);
      vec3 d1 = vec3(0.22, 0.18, 0.60);   // indigo
      vec3 d2 = vec3(0.42, 0.10, 0.42);   // plum
      vec3 d3 = vec3(0.04, 0.34, 0.32);   // teal
      vec3 d4 = vec3(0.08, 0.20, 0.50);   // blue

      vec3 base = mix(lb, db, uDark);
      float k = mix(0.72, 0.55, uDark);   // how far blobs pull away from the base
      vec3 col = base;
      col = mix(col, mix(l1, d1, uDark), blob(p, c1, 0.42) * k);
      col = mix(col, mix(l2, d2, uDark), blob(p, c2, 0.38) * k);
      col = mix(col, mix(l3, d3, uDark), blob(p, c3, 0.40) * k);
      col = mix(col, mix(l4, d4, uDark), blob(p, c4, 0.34) * k);

      // dither: kills banding in the long, shallow gradients
      col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0 * 1.5;
      gl_FragColor = vec4(col, 1.0);
    }`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    root.classList.add('no-shader');
    return;
  }
  gl.useProgram(prog);

  // one triangle that covers the screen
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes  = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uDark = gl.getUniformLocation(prog, 'uDark');

  // Fraction of CSS pixels to render. Soft gradients survive heavy upscaling.
  const SCALE = coarse ? 0.22 : 0.35;
  const FPS   = coarse ? 24 : 30;

  function resize() {
    const w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
    const h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  const darkTarget = () => (root.classList.contains('dark') ? 1 : 0);
  let dark = darkTarget();
  // random start so the composition differs per visit
  const t0 = performance.now() - Math.random() * 60000;
  let raf = 0, last = 0;

  function draw(now) {
    resize();
    dark += (darkTarget() - dark) * (still ? 1 : 0.12);   // ease between themes
    if (Math.abs(darkTarget() - dark) < 0.002) dark = darkTarget();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform1f(uDark, dark);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    root.classList.add('shader-ready');
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 1000 / FPS) return;
    last = now;
    draw(now);
  }

  function start() { if (!raf && !still) raf = requestAnimationFrame(loop); }
  function stop()  { cancelAnimationFrame(raf); raf = 0; }

  draw(performance.now());
  start();

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  // still frame mode still has to follow theme and size changes
  new MutationObserver(() => { if (still) draw(performance.now()); })
    .observe(root, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', () => { if (still) draw(performance.now()); });

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); root.classList.add('no-shader'); });
})();
