# portfolio

A static personal site — plain HTML, CSS and JavaScript. No build step,
no dependencies, no framework. Open `index.html` and it works.

Design modelled on [nikhilwho.in](https://nikhilwho.in): a single narrow
column, white page (dark mode on `D`), Instrument Serif for the name,
Google Sans Flex for everything else, `# heading` section titles, and a soft
highlight that slides between rows on hover. All markup and CSS are written
from scratch for this site.

## Run it

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Opening `index.html` directly with `file://` works too.

## Edit it

Almost everything lives in **`js/data.js`** — your name, bio, projects, posts,
work history and links. Change that one file and every page updates.

| File            | What's in it                                              |
|-----------------|-----------------------------------------------------------|
| `js/data.js`    | **All content.** Start here.                              |
| `css/styles.css`| The whole theme — colour tokens, light and dark.          |
| `js/main.js`    | Rendering, theme switch, accordion, hover highlight, keys.|
| `js/shader.js`  | The animated WebGL background.                            |
| `js/glass.js`   | Liquid-glass refraction (desktop Chromium).               |
| `js/oneko.js`   | The cat (third-party, MIT).                               |
| `*.html`        | Page structure: home, work, projects, writing.            |

### What still needs you

1. **Project links** — none of the four projects has a public repo, so each
   links to `github.com/shukla007`. Set `url` / `repo` per project in
   `js/data.js` when they're public (`live` gives a globe icon instead).
2. **Project `year`** — guesses (the résumé has no project dates).

The résumé lives at `assets/Abhishek_Resume-up.pdf` (`SITE.profile.resume`).
If you rename it, update that and the hard-coded `href` fallbacks in each page.

Writing: the writing page drops out of the dock and the `b` shortcut while
`SITE.writing` is empty. When you add the first post, also add
`writing.html` to `sitemap.xml`.

## Metadata, SEO and the visitor count

The site lives at **https://abhishek-shukla.vercel.app** (`SITE.site.url`).
Every page has a description, canonical URL, Open Graph and Twitter card tags
pointing at `assets/og.png` (a 1200×630 preview card), and the home page has
schema.org `Person` data. Icons: `favicon.ico`, `assets/favicon.svg`,
`assets/apple-touch-icon.png` and the `site.webmanifest` icons. `robots.txt`
and `sitemap.xml` sit at the root.

If the address changes, update `SITE.site.url`, the `canonical` / `og:url` /
`og:image` / `twitter:image` tags in each page's `<head>`, `robots.txt`,
`sitemap.xml`, and the URL printed on `assets/og.png`.

The footer's **Visitors #N** comes from [Abacus](https://abacus.jasoncameron.dev)
(free, no account). It counts once per browser session, only on the live
address, so local previews never inflate it. If the service is unreachable the
footer shows the © line instead. Keys on the free tier expire after long
inactivity, so a site with no visitors for months could restart from 1.

## The cat

[oneko.js](https://github.com/adryd325/oneko.js) — the classic Neko, chasing the
cursor around the page. It sits still when you do, and after about 20 seconds
idle it starts washing itself, scratching the edge of the window, or falling
asleep.

It's vendored at `js/oneko.js` with the sprite sheet at `assets/oneko.gif`, and
wired up at the bottom of every page:

```html
<script src="js/oneko.js" data-cat="assets/oneko.gif"></script>
```

- **To remove it**, delete that line from the four HTML files.
- **To change the cat**, point `data-cat` at another 256×128 sprite sheet — the
  oneko repo links to several (dog, maia, tora, silversky).
- It remembers where it was via `localStorage`, so it carries across pages
  instead of resetting to the corner.
- It doesn't run under `prefers-reduced-motion`, and it's hidden when printing.

### Third-party notice

oneko.js is Copyright © 2022 adryd, MIT licensed. The full licence is kept
alongside it at `js/oneko.LICENSE.txt` — leave it in place if you redistribute
the site.

## Keyboard shortcuts

`h` home · `w` work · `p` projects · `b` writing · `r` resume · `d` dark mode

## Theme

Colours are CSS variables at the top of `css/styles.css` — `:root` for light,
`html.dark` for dark. The choice is remembered in `localStorage`; a tiny inline
script in each page's `<head>` applies it before first paint so dark mode never
flashes white.

| Token     | Light     | Dark      | Used for                 |
|-----------|-----------|-----------|--------------------------|
| `--bg`    | `#ffffff` | `#0b0b0b` | page background          |
| `--text`  | `#404040` | `#a3a3a3` | body copy                |
| `--strong`| `#171717` | `#f5f5f5` | links, titles            |
| `--muted` | `#737373` | `#a3a3a3` | descriptions             |
| `--faint` | `#a3a3a3` | `#737373` | dates, icons             |

Fonts (Google Fonts): Instrument Serif (name), Google Sans Flex (everything
else), Herr Von Muellerhoff (the signature in the footer).

Home page details, all driven by `js/data.js`:

- **Avatar** — add photos to `profile.avatars` and clicking it cycles them.
- **Experience** — rows open on click to show the blurb, points and tags.
  Set `logo` on a role for a real logo; otherwise it shows a monogram.
- **Projects** — `featured: true` puts one on the home page using its `short`
  line; the projects page shows the full blurb and tags.
- **Footer** — `profile.location` plus a live clock in `profile.timezone`.

## Liquid glass + animated background

**Background.** `js/shader.js` draws a slow mesh gradient (lavender, peach,
mint, sky in light mode; indigo, plum, teal in dark) into a WebGL canvas behind
the page, with a faint grid over it (`.bg-grid` in `css/styles.css`). It renders
at a fraction of screen resolution, caps at 30fps (24 on phones), stops when the
tab is hidden, and draws one still frame for reduced motion. Without WebGL a
still CSS gradient takes its place. Colours live in the shader's `FRAG` string.

**Glass.** The `.glass` class in `css/styles.css` is the material (tint, bright
top rim, dark lower rim, shadow, sheen, backdrop blur). It's on the floating
dock, the hover highlight, the theme switch, the sub-page bar, the toast and the
project tiles. Glass always sits *behind* text or floats over the page; it never
covers the text it belongs to.

`js/glass.js` adds real refraction on desktop Chromium (Chrome, Edge, Brave,
Arc): each `[data-glass]` element gets an SVG displacement map shaped like its
rounded rectangle, so the background bends at the rim like a thick lens. Tune
with `data-glass-bezel` (rim width), `data-glass-scale` (bend) and
`data-glass-blur` (frost), in px. Safari, Firefox and all touch devices get
frosted glass only, which is much cheaper on phone GPUs.

**Dock.** The floating bar at the bottom is the site navigation (home, work,
projects, writing), plus the résumé and the music toggle. It marks the current
page.

**Mobile.** Tighter side margins, bigger tap targets, no keyboard hint, long
company names truncate, the cat only loads where there's a mouse, and the
browser's address bar follows the light/dark theme.

## Deploy

Any static host — GitHub Pages, Netlify, Vercel, Cloudflare Pages. No build
command, publish directory is the repo root.
