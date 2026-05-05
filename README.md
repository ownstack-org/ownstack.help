# ownstack.help

Hand-rolled static documentation for OwnStack. No framework. Lives at <https://ownstack.help>.

## Layout

```
.
├── index.html         hand-written homepage (splash hero)
├── favicon.svg
├── assets/            CSS, JS, logo
├── _layout/           shared chrome (header, sidebar, footer, page template)
├── content/           one HTML fragment per article (with frontmatter comment)
├── build.js           wraps content/* in chrome → final pages at repo root
├── package.json       just `serve` for runtime
└── Procfile           web: serve -l tcp://0.0.0.0:$PORT .
```

## Authoring

Add a new article:

1. Create `content/<section>/<slug>.html` with a frontmatter comment at the top:
   ```html
   <!-- meta {"title":"…","desc":"…","section":"Apps"} -->
   <p class="lede">…opening line…</p>
   <h2>…</h2>
   <p>…</p>
   ```
2. Add the link to `_layout/sidebar.html`.
3. Run `npm run build`.
4. Open `index.html` (or any built page) in a browser to preview.

## Build

```bash
npm install
npm run build       # walks content/, emits final HTML at the repo root, builds search-index.json
npm start           # serves the repo root on $PORT (default 3000)
```

The build script is small and lives at `build.js` — read it before changing it. It does template substitution, scroll-spy ID injection, breadcrumb building, sidebar active-state marking, and a flat search index.

## Deploy

Deploys to the `ownstack-help` app on the `zenith-zone-582` stack via `ownstack deploy`. The dokku herokuish nodejs buildpack runs `npm install` then `npm run build` (via `heroku-postbuild`), then starts `web: serve -l tcp://0.0.0.0:$PORT .`.

## Style

- Dark by default (slate base). Pink (`#ec4899`) is the load-bearing identity color.
- Type stack: system sans for UI, system serif fallback for headings if needed, JetBrains Mono / SF Mono for code.
- Code blocks with the `terminal` class get window chrome; the `<span class="prompt">$</span>` marks command lines and is stripped on copy.
- Callouts: `<div class="callout note|tip|warning|danger"><div><strong>Title</strong><p>Body</p></div></div>`.
