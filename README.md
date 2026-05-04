# OwnStack documentation

Source for the user manual at [ownstack.help](https://ownstack.help).

Built with [Astro Starlight](https://starlight.astro.build/). Deploys to the `ownstack-help` app on the `zenith-zone-582` stack via `ownstack deploy`.

## Local development

```bash
npm install
npm run dev      # localhost:4321 with hot reload
npm run build    # static output in dist/
npm run start    # serve dist/ locally (matches what runs in prod)
```

## Authoring

Content lives in `src/content/docs/` as Markdown / MDX. The sidebar is configured in `astro.config.mjs`.

To add a page:

1. Create a `.md` (or `.mdx`) file under the appropriate subdirectory (`getting-started/`, `concepts/`, `how-to/`, `cli/`).
2. Add a sidebar entry in `astro.config.mjs`.

Front-matter shape:

```yaml
---
title: Page title
description: One-line description used in metadata and cards.
---
```

## Production runtime

The herokuish nodejs buildpack runs `npm run build`; the `web` process is `serve -s dist -l tcp://0.0.0.0:$PORT` (declared in `Procfile`). Static output, no app server.
