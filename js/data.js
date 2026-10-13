/* ============================================================
   EDIT EVERYTHING HERE.
   Every page reads from this one object — change the text below
   and the whole site updates. No build step, no framework.
   ============================================================ */

const SITE = {

  /* ---------- where the site lives ----------
     url      →  the live address, no trailing slash. If you move the site,
                 also update the canonical / og:url / og:image tags in each
                 .html <head>, robots.txt and sitemap.xml.
     counter  →  the footer visitor count, kept by Abacus
                 (abacus.jasoncameron.dev, free, no account). It only counts
                 visits on the live address, once per browser session, so
                 local previews never inflate it.                           */
  site: {
    url: 'https://abhishek-shukla.vercel.app',
    counter: { namespace: 'abhishek-shukla-vercel-app', key: 'visits' },
  },

  /* ---------- who you are ---------- */
  profile: {
    name:     'Abhishek Shukla',
    handle:   'shukla007',
    initials: 'AS',
    avatar:   'assets/avatar.png',         // set to '' to show initials instead
    // Add more photos here and clicking the avatar cycles through them.
    avatars:  [],
    role:     'full stack',                // the small line under your name
    tagline:  'react native · node.js · genai',
    location: 'Noida, India',
    timezone: 'Asia/Kolkata',              // drives the live clock in the footer
    status:   'open to full-stack & AI roles',
    resume:   'assets/Abhishek_Resume-up.pdf',

    // The short bio on the home page. Keep it to 2–3 sentences.
    bio: [
      'Full stack developer building mobile and web products end to end — React Native and Next.js on the front, Node.js and Postgres behind them.',
      'Most recently <strong>Full Stack Developer at Riya Techno Services</strong>, where I owned a hospital management platform from database schema to shipped app.',
      'Lately I build LLM-powered features: RAG over pgvector, tool calling, and vision models that replace manual data entry.',
    ],

    // Things you actually reach for.
    stack: ['React Native', 'Expo', 'TypeScript', 'Next.js', 'Node.js',
            'Express', 'PostgreSQL', 'MongoDB', 'pgvector', 'Docker'],
  },

  /* ---------- background music ----------
     Supply the file yourself: drop an .mp3 at the path below.
     Browsers block autoplay with sound, so the track starts when the visitor
     clicks the speaker button — after that the choice is remembered.        */
  audio: {
    src:    'assets/bgm.mp3',
    title:  'Interstellar — main theme',   // tooltip on the toggle
    volume: 0.35,                          // 0–1, faded in over ~1.2s
  },

  /* ---------- links in the footer ---------- */
  socials: [
    { label: 'github',   url: 'https://github.com/shukla007' },
    { label: 'linkedin', url: 'https://linkedin.com/in/abhishekshukla007' },
    { label: 'email',    url: 'mailto:shuklaabhishekkumar007@gmail.com',
                         copy: 'shuklaabhishekkumar007@gmail.com' },
  ],

  /* ---------- projects ----------
     featured: true  →  also appears on the home page
     short           →  the one-line description used on the home page
     url             →  where the row links; repo → the GitHub icon,
                        live → a globe icon instead (set one, not both)
     NOTE: `year` and `repo` are my best guess — your resume lists every project
     under github.com/shukla007 without dates. Set the real repo URLs and the
     year you shipped each one.                                              */
  projects: [
    {
      name: 'Smart Inventory',
      short: 'AI stock-taking: a vision LLM reads items and receipts from the camera.',
      year: '2026',
      blurb: 'AI-powered stock-taking platform: a React Native app, a Next.js admin dashboard and a shared Node.js API. A vision LLM reads items and receipts from the camera, and natural-language catalogue search runs on RAG over pgvector.',
      tags: ['typescript', 'next.js', 'pgvector', 'llm'],
      url: 'https://github.com/shukla007',
      repo: 'https://github.com/shukla007',
      featured: true,
    },
    {
      name: 'HTTP File Server',
      short: 'Peer-to-peer file sharing over local Wi-Fi. Live on Google Play.',
      year: '2025',
      blurb: 'Peer-to-peer file sharing over local Wi-Fi — the app runs an embedded HTTP server so any nearby browser can browse and download shared files. Transfers resume after network drops, and a real-time WebSocket dashboard shows transfer speeds and connected devices. On Google Play.',
      tags: ['react native', 'tcp sockets', 'zustand'],
      url: 'https://github.com/shukla007',
      repo: 'https://github.com/shukla007',
      featured: true,
    },
    {
      name: 'Inventory Management System',
      short: 'Offline-first mobile inventory with barcode scanning and background sync.',
      year: '2025',
      blurb: 'Offline-first mobile inventory for large catalogues, with barcode scanning, batched background sync to a Node.js API and an indexed SQLite schema for instant search.',
      tags: ['expo sqlite', 'react query', 'node.js'],
      url: 'https://github.com/shukla007',
      repo: 'https://github.com/shukla007',
      featured: true,
    },
    {
      name: 'Files Downloader',
      short: 'Download manager with parallel chunked downloads and pause/resume.',
      year: '2025',
      blurb: 'Multi-threaded download manager with parallel chunked downloads and pause/resume for large files, built on scoped storage for Android 11+ and iOS.',
      tags: ['react native', 'background fetch'],
      url: 'https://github.com/shukla007',
      repo: 'https://github.com/shukla007',
      featured: false,
    },
  ],

  /* ---------- writing ----------
     Empty for now — the writing section hides itself until you add a post.
     Each entry: { title, date: 'YYYY-MM-DD', blurb, url, featured }         */
  writing: [],

  /* ---------- work history ---------- */
  experience: [
    {
      role: 'Full Stack Developer',
      org: 'Riya Techno Services Pvt. Ltd.',
      short: 'Riya Techno Services',       // shown on the home page
      logo: '',                            // path to a square logo; '' shows a monogram
      url: '',
      period: 'Jan 2026 — Jul 2026',
      place: 'Patna, Bihar',
      blurb: 'Delivered a hospital management platform end to end — the Node.js/Express REST API, the PostgreSQL data layer, and the React Native mobile app used by doctors, staff and administrators.',
      points: [
        'Designed the database schema and REST endpoints with role-based access control (RBAC) and JWT authentication to secure patient records.',
        'Reduced patient registration time by redesigning the intake flow with client-side validation and server-side deduplication.',
        'Implemented offline-first sync between the mobile app and the API, keeping core hospital modules functional without internet connectivity.',
        'Improved screen load times through API response optimisation, caching and asynchronous data loading.',
        'Converted Figma designs into a responsive Material Design 3 UI in collaboration with hospital staff and stakeholders.',
      ],
      tags: ['node.js', 'express', 'react native', 'postgresql'],
    },
  ],

  /* ---------- education ---------- */
  education: [
    {
      degree: 'Master of Computer Applications (MCA)',
      school: 'Galgotias University',
      place:  'Noida, India',
    },
    {
      degree: 'Bachelor of Computer Applications (BCA)',
      school: 'L.S. College',
      place:  'Bihar, India',
    },
  ],
};

if (typeof module !== 'undefined') module.exports = SITE;
