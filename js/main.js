/* ------------------------------------------------------------------
   Renders every page from SITE (js/data.js) and wires up the small bits
   of interaction: theme switch, accordion, sliding hover highlight,
   keyboard shortcuts, copy-to-clipboard, footer clock, music.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Escape anything that comes from data.js and lands in innerHTML.
     The bio field is the one deliberate exception — it allows <strong>. */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  const fmtDate = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const ext = 'target="_blank" rel="noopener noreferrer"';

  function showToast(msg) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-shown');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('is-shown'), 2200);
  }

  /* ---------------- icons ---------------- */

  const ICON = {
    verified: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-label="verified"><path d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/></svg>',
    mail: (s = 13) => `<svg viewBox="0 0 512 512" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>`,
    github: (s = 13) => `<svg viewBox="0 0 496 512" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>`,
    linkedin: '<svg viewBox="0 0 448 512" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>',
    x: '<svg viewBox="0 0 512 512" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>',
    resume: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8H8v-.57c0-.81.48-1.53 1.22-1.85a6.95 6.95 0 0 1 5.56 0A2.01 2.01 0 0 1 16 17.43V18z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    chevron: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    // 7×6 pixel heart
    heart: '<svg viewBox="0 0 7 6" aria-hidden="true" shape-rendering="crispEdges"><path d="M1 0h2v1H1zM4 0h2v1H4zM0 1h7v2H0zM1 3h5v1H1zM2 4h3v1H2zM3 5h1v1H3z"/></svg>',
  };

  const social = (name) => (SITE.socials.find((x) => x.label === name) || {});

  // A social link as an icon-link; email copies to the clipboard.
  const iconLink = (name, icon, label = '', title = '') => {
    const s = social(name);
    if (!s.url) return '';
    const attrs = s.copy ? `data-copy="${esc(s.copy)}"` : ext;
    const aria = label ? '' : ` aria-label="${esc(title || name)}" title="${esc(title || name)}"`;
    return `<a href="${esc(s.url)}" ${attrs} class="ilink"${aria}>${icon}${esc(label)}</a>`;
  };

  /* ---------------- partial templates ---------------- */

  const tags = (list) => (list && list.length)
    ? `<div class="tags">${list.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : '';

  const logo = (r) => r.logo
    ? `<span class="logo"><img src="${esc(r.logo)}" alt="${esc(r.org)}"></span>`
    : `<span class="logo" aria-hidden="true">${esc((r.short || r.org).trim()[0] || '')}</span>`;

  const expHead = (r, i, asButton) => {
    const sub = r.place
      ? `<span class="exp-sub">· ${esc(r.place)}</span>` : '';
    const inner = `
      <span class="exp-main">
        ${logo(r)}
        <span class="exp-text">
          <span class="exp-title">
            <span>${esc(asButton ? (r.short || r.org) : r.org)}</span>${sub}
            ${asButton ? ICON.chevron : ''}
          </span>
          <span class="exp-role">${esc(r.role)}</span>
          <span class="exp-date exp-date--inline">${esc(r.period)}</span>
        </span>
      </span>
      <span class="exp-date exp-date--side">${esc(r.period)}</span>`;
    return asButton
      ? `<button type="button" class="exp-trigger" aria-expanded="false" aria-controls="exp-${i}">${inner}</button>`
      : `<div class="exp-trigger">${inner}</div>`;
  };

  const expDetail = (r) => `
    <div class="exp-detail">
      ${r.blurb ? `<p>${esc(r.blurb)}</p>` : ''}
      ${(r.points || []).length ? `<ul>${r.points.map((p) => `<li><span>${esc(p)}</span></li>`).join('')}</ul>` : ''}
      ${tags(r.tags)}
    </div>`;

  // Home page: collapsed rows that open on click.
  const expItem = (r, i) => `
    <div class="exp-item">
      ${expHead(r, i, true)}
      <div class="exp-body" id="exp-${i}" role="region"><div>${expDetail(r)}</div></div>
    </div>`;

  // Work page: always open.
  const roleBlock = (r, i) => `<article class="role-block">${expHead(r, i, false)}${expDetail(r)}</article>`;

  const projIcon = (p) => {
    if (p.repo) return `<a href="${esc(p.repo)}" ${ext} class="proj-icon" aria-label="github" title="github">${ICON.github(15)}</a>`;
    if (p.live) return `<a href="${esc(p.live)}" ${ext} class="proj-icon" aria-label="live" title="live">${ICON.globe}</a>`;
    return '';
  };

  const projItem = (p, full) => `
    <li class="proj">
      <a href="${esc(p.url || p.live || p.repo || '#')}" ${ext} class="proj-link">
        <span class="doc glass" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="proj-text">
          <span class="proj-name">${esc(p.name)}${full && p.year ? `<span class="proj-year">${esc(p.year)}</span>` : ''}</span>
          <span class="proj-desc">${esc(full ? p.blurb : (p.short || p.blurb))}</span>
          ${full ? tags(p.tags) : ''}
        </span>
      </a>
      ${projIcon(p)}
    </li>`;

  const postRow = (w) => `
    <a href="${esc(w.url)}" ${/^https?:/.test(w.url) ? ext : ''} class="row">
      <span class="title">${esc(w.title)}</span>
      <span class="meta">${esc(fmtDate(w.date))}${w.read ? ` · ${esc(w.read)}` : ''}</span>
    </a>`;

  const eduRow = (e) => `
    <div class="row wrap-ok">
      <span class="title">${esc(e.degree)}<span class="sub">${esc(e.school)}</span></span>
      <span class="meta">${esc(e.place || '')}</span>
    </div>`;

  /* ---------------- render ---------------- */

  function render() {
    if (typeof SITE === 'undefined') return;
    const { profile, projects, writing, experience } = SITE;
    const mount = (sel, html) => { const n = $(sel); if (n) n.innerHTML = html; };

    // plain text fields: <span data-field="profile.name">
    $$('[data-field]').forEach((el) => {
      const val = el.dataset.field.split('.').reduce((o, k) => (o || {})[k], SITE);
      if (val != null && val !== '') el.textContent = val;
    });

    // <a data-href="profile.resume">
    $$('[data-href]').forEach((el) => {
      const val = el.dataset.href.split('.').reduce((o, k) => (o || {})[k], SITE);
      if (val) el.setAttribute('href', val);
    });

    // Avatar. With more than one photo it becomes a button that cycles them.
    const avatar = $('[data-avatar]');
    if (avatar) {
      const photos = [profile.avatar, ...(profile.avatars || [])].filter(Boolean);
      const initials = `<span class="initials">${esc(profile.initials)}</span>`;
      if (!photos.length) {
        avatar.innerHTML = initials;
      } else {
        avatar.innerHTML = `<img src="${esc(photos[0])}" alt="${esc(profile.name)}" width="56" height="56">`;
        const img = avatar.firstElementChild;
        // Missing or broken file: fall back to initials rather than a torn-image icon.
        img.addEventListener('error', () => { avatar.innerHTML = initials; });
        if (photos.length > 1) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = avatar.className;
          btn.setAttribute('aria-label', 'Show next photo');
          btn.append(img);
          avatar.replaceWith(btn);
          let i = 0;
          btn.addEventListener('click', () => {
            i = (i + 1) % photos.length;
            img.style.opacity = '0';
            img.style.transform = 'scale(1.1)';
            setTimeout(() => {
              img.src = photos[i];
              img.style.opacity = '';
              img.style.transform = '';
            }, 150);
          });
        }
      }
    }

    const verified = $('[data-verified]');
    if (verified) verified.innerHTML = ICON.verified;

    // Intro copy on the home page.
    const intro = $('[data-intro]');
    if (intro) {
      const more = [
        `<a class="link" href="work.html">my work</a>`,
        `<a class="link" href="projects.html">all projects</a>`,
      ];
      if (writing.length) more.push(`<a class="link" href="writing.html">my writing</a>`);
      const moreLine = more.length > 2
        ? `${more.slice(0, -1).join(', ')}, and ${more[more.length - 1]}`
        : more.join(' and ');

      const gh = social('github');
      const reach = [
        social('email').url ? `Reach me via ${iconLink('email', ICON.mail(), 'email')}` : '',
        gh.url ? `see my code on ${iconLink('github', ICON.github(), 'GitHub')}` : '',
      ].filter(Boolean).join(' · ');

      const elsewhere = ['linkedin', 'x', 'twitter']
        .map((n) => iconLink(n, n === 'linkedin' ? ICON.linkedin : ICON.x, '', n))
        .join('');

      intro.innerHTML = `
        ${profile.bio.map((p) => `<p>${p}</p>`).join('')}
        <p>More about ${moreLine}.</p>
        ${reach ? `<p>${reach}.</p>` : ''}
        <p class="findme">
          ${elsewhere ? `<span>Find me on</span>${elsewhere}<span>, or grab my</span>` : '<span>Grab my</span>'}
          <span><a href="${esc(profile.resume)}" ${ext} class="ilink">${ICON.resume}resume</a>.</span>
        </p>`;
    }

    mount('[data-render="experience-compact"]', experience.map(expItem).join(''));
    mount('[data-render="experience"]', experience.map(roleBlock).join(''));
    mount('[data-render="education"]', (SITE.education || []).map(eduRow).join(''));

    mount('[data-render="featured-projects"]',
      projects.filter((p) => p.featured).map((p) => projItem(p, false)).join(''));
    mount('[data-render="all-projects"]',
      projects.map((p) => projItem(p, true)).join(''));

    mount('[data-render="all-writing"]',
      writing.slice().sort((a, b) => b.date.localeCompare(a.date)).map(postRow).join(''));
    if (!writing.length) {
      mount('[data-render="all-writing"]', '');
      mount('[data-render="writing-empty"]', `
        <p class="empty">Nothing published yet, the first post is in progress.
          Meanwhile, the code is on <a class="link" href="${esc(social('github').url || '#')}" ${ext}>GitHub</a>.</p>`);
    }

    // Stack as a quiet dotted line.
    mount('[data-stack]', (profile.stack || []).map(esc).join(' · '));

    // Links that should follow whatever is in SITE.socials.
    $$('[data-social]').forEach((el) => {
      const s2 = social(el.dataset.social);
      if (!s2.url) { el.remove(); return; }
      el.setAttribute('href', s2.url);
      if (s2.copy) el.setAttribute('data-copy', s2.copy);
      else { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    });

    // The note line under projects: availability, opens email.
    const note = $('[data-note]');
    if (note) {
      if (!profile.status) note.remove();
      else note.innerHTML = `${ICON.heart}<span>currently ${esc(profile.status)}. <span class="u">let's talk?</span></span>`;
    }

    const year = $('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------------- interaction ---------------- */

  /* Theme. The class is set before paint by the inline script in <head>;
     this only flips it and remembers the choice. */
  function setTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
    $$('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-checked', String(dark)));
    syncThemeColor();
  }
  // Mobile browser chrome (address bar) follows the page theme.
  function syncThemeColor() {
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = document.documentElement.classList.contains('dark') ? '#0b0b0b' : '#fbfbfc';
  }
  function themeToggle() {
    const isDark = () => document.documentElement.classList.contains('dark');
    $$('[data-theme-toggle]').forEach((b) => {
      b.setAttribute('aria-checked', String(isDark()));
      b.addEventListener('click', () => setTheme(!isDark()));
    });
    return () => setTheme(!isDark());
  }

  // Experience rows open and close in place.
  function accordion() {
    $$('.exp-item').forEach((item) => {
      const btn = $('.exp-trigger', item);
      btn.addEventListener('click', () => {
        const open = !item.classList.contains('open');
        item.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
        // the highlight should follow the row's new height
        item.dispatchEvent(new Event('pointerenter'));
      });
    });
  }

  /* One soft background that slides to whichever row is under the pointer. */
  function hoverHighlight() {
    $$('.hl-list, .rows').forEach((list) => {
      const hl = document.createElement('div');
      hl.className = 'hl glass';
      hl.setAttribute('aria-hidden', 'true');
      // A liquid-glass slab (js/glass.js) sitting *behind* the row: it frosts
      // and bends the animated background, never the row's own text.
      hl.dataset.glass = '';
      hl.dataset.glassBlur = '8';
      hl.dataset.glassBezel = '12';
      hl.dataset.glassScale = '28';
      list.prepend(hl);
      let shown = false;
      const pad = +list.dataset.hlPad || 0;   // breathing room above and below tight rows

      const moveTo = (el) => {
        const place = () => {
          hl.style.transform = `translateY(${el.offsetTop - pad}px)`;
          hl.style.height = (el.offsetHeight + pad * 2) + 'px';
          if (hl._glass) hl._glass.update();   // reshape the lens to the new row
        };
        if (!shown) {
          // first appearance: jump into place, then fade in
          hl.style.transition = 'none';
          place();
          void hl.offsetHeight;
          hl.style.transition = '';
          shown = true;
        } else {
          place();
        }
        hl.style.opacity = '1';
      };

      Array.from(list.children).forEach((el) => {
        if (el === hl) return;
        el.addEventListener('pointerenter', () => moveTo(el));
        // keep tracking while an accordion animates open/closed
        el.addEventListener('transitionend', () => { if (shown && el.matches(':hover')) moveTo(el); });
      });
      list.addEventListener('pointerleave', () => { hl.style.opacity = '0'; shown = false; });
    });
  }

  // Single-key shortcuts: h w p b r, and d for dark mode.
  function keyboardNav(toggleTheme) {
    const resume = (typeof SITE !== 'undefined' && SITE.profile.resume) || '';
    const map = { h: 'index.html', w: 'work.html', p: 'projects.html' };
    if (typeof SITE !== 'undefined' && SITE.writing.length) map.b = 'writing.html';

    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
      const k = e.key.toLowerCase();
      if (k === 'd') { e.preventDefault(); toggleTheme(); return; }
      if (k === 'r' && resume) { e.preventDefault(); window.open(resume, '_blank', 'noopener'); return; }
      if (map[k]) { e.preventDefault(); location.href = map[k]; }
    });
  }

  function copyHandlers() {
    document.addEventListener('click', async (e) => {
      const el = e.target.closest('[data-copy], [data-copy-url]');
      if (!el) return;
      e.preventDefault();
      const text = el.hasAttribute('data-copy-url') ? location.href : el.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        showToast(el.hasAttribute('data-copy-url') ? 'link copied' : 'copied ' + text);
      } catch {
        if (el.hasAttribute('data-copy')) location.href = el.getAttribute('href');   // clipboard blocked — just open mail
      }
    });
  }

  // "Noida, India 11:20 AM" in the site owner's timezone.
  function footerClock() {
    const el = $('[data-clock]');
    if (!el || typeof SITE === 'undefined') return;
    const tz = SITE.profile.timezone;
    const fmt = () => {
      try {
        el.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz });
      } catch {
        el.textContent = '';
      }
    };
    fmt();
    setInterval(fmt, 15000);
  }

  /* Looping background music.

     Browsers refuse to autoplay audio until the visitor interacts with the
     page, and the track is a file the site owner supplies — it may simply not
     be there. So the button stays hidden until we know there is something to
     play, playback always starts from a click, and the choice is remembered. */
  function backgroundMusic() {
    const btn = $('#bgm-toggle');
    const el  = $('#bgm');
    if (!btn || !el || typeof SITE === 'undefined') return;

    const cfg = SITE.audio || {};
    if (!cfg.src) return;                      // no track configured — no button

    const MAX = Math.min(Math.max(cfg.volume ?? 0.35, 0), 1);
    const KEY = 'bgm';

    const remember = (v) => { try { localStorage.setItem(KEY, v); } catch {} };
    const recall   = ()  => { try { return localStorage.getItem(KEY); } catch { return null; } };

    el.src = cfg.src;
    el.loop = true;
    el.volume = 0;
    btn.hidden = false;
    btn.title = cfg.title || 'background music';

    let raf = 0;
    const fadeTo = (target, ms) => {
      cancelAnimationFrame(raf);
      const from = el.volume;
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min((t - t0) / ms, 1);
        el.volume = Math.min(1, Math.max(0, from + (target - from) * k));
        if (k < 1) raf = requestAnimationFrame(step);
        else if (target === 0) el.pause();
      };
      raf = requestAnimationFrame(step);
    };

    const setPressed = (on) => {
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', (on ? 'Pause' : 'Play') + ' background music');
    };

    async function start(userInitiated) {
      try {
        await el.play();
        setPressed(true);
        fadeTo(MAX, 1200);
        remember('on');
        return true;
      } catch (err) {
        // NotAllowedError just means "not yet" — the browser wants a gesture.
        if (err && err.name === 'NotAllowedError') return false;
        if (userInitiated) showToast('no audio file at ' + cfg.src);
        btn.hidden = true;
        return false;
      }
    }

    function stop() {
      setPressed(false);
      fadeTo(0, 500);
      remember('off');
    }

    // A missing or unplayable file: drop the control rather than leave a dud.
    el.addEventListener('error', () => {
      if (el.getAttribute('src')) btn.hidden = true;
    });

    btn.addEventListener('click', () => {
      if (el.paused) start(true); else stop();
    });

    // Returning visitor who had it on: try straight away, and if the browser
    // blocks it, fall back to resuming on their first interaction.
    if (recall() === 'on') {
      start(false).then((ok) => {
        if (ok) return;
        const resume = () => start(false);
        document.addEventListener('pointerdown', resume, { once: true });
        document.addEventListener('keydown', resume, { once: true });
      });
    }
  }

  /* Visitor count in the footer, kept by Abacus (abacus.jasoncameron.dev).
     /hit adds one and returns the total, /get only reads it. We hit once per
     browser session, and only on the live address, so reloads and local
     previews don't inflate the number. On any failure the © line stays. */
  function visitorCount() {
    const el = $('[data-visitors]');
    const cfg = typeof SITE !== 'undefined' && SITE.site;
    if (!el || !cfg || !cfg.counter || !window.fetch) return;

    let live = false;
    try { live = location.hostname === new URL(cfg.url).hostname; } catch {}
    let counted = false;
    try { counted = sessionStorage.getItem('visit-counted') === '1'; } catch {}

    const { namespace, key } = cfg.counter;
    const action = live && !counted ? 'hit' : 'get';
    const ctrl = 'AbortController' in window ? new AbortController() : null;
    const timer = ctrl && setTimeout(() => ctrl.abort(), 5000);

    fetch(`https://abacus.jasoncameron.dev/${action}/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`,
          { signal: ctrl && ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        const n = Number(d && d.value);
        if (!Number.isFinite(n) || n < 1) return;
        if (action === 'hit') { try { sessionStorage.setItem('visit-counted', '1'); } catch {} }
        el.innerHTML = `Visitors <span class="fg">#${n}</span>`;
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
  }

  // Highlight the current page in the floating dock.
  function markDock() {
    const here = location.pathname.split('/').pop() || 'index.html';
    $$('.dock-item[data-page]').forEach((a) => {
      if (a.dataset.page === here) a.setAttribute('aria-current', 'page');
      // no posts yet: don't send people to an empty page
      if (a.dataset.page === 'writing.html' && !SITE.writing.length && here !== 'writing.html') a.hidden = true;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();
    syncThemeColor();
    markDock();
    const toggleTheme = themeToggle();
    accordion();
    hoverHighlight();
    keyboardNav(toggleTheme);
    copyHandlers();
    footerClock();
    visitorCount();
    backgroundMusic();
  });
})();
