---
title: Apps
description: How OwnStack models the unit of "an app" — code, config, processes, and databases.
---

An **app** in OwnStack is what you'd call an app anywhere else: a codebase that runs as one or more processes, with environment variables, optional databases, and at least one URL.

## The shape of an app

- **Repo + branch** — typically the `main` branch of a GitHub repo, but any git remote works.
- **Procfile** — declares which processes the app runs (`web`, `worker`, etc.). Same format as Heroku.
- **Buildpack or Dockerfile** — how the build runs. OwnStack auto-detects.
- **Config vars** — environment variables, set per-app and per-stack.
- **Linked services** — Postgres, MySQL, Redis, etc. attached to the app.
- **Domains** — one or more domains routed to the app.

## Apps deploy to one or more stacks

Most apps deploy to a single stack. Some deploy to multiple — e.g. a staging stack and a production stack, or a primary and a failover. Add or remove stacks for an app under **Deploy targets** in the UI, or via `ownstack app stacks`.

When an app has multiple stacks, each `ownstack deploy` deploys to *all* of them. Each stack has its own dokku state — its own scale, its own running processes, its own logs.

## The `.ownstack-config` file

A small file that lives in your repo (gitignore'd by default) that links your local checkout to a specific app on a specific control plane. It carries the app token used for `ownstack deploy`, `ownstack run`, etc.

```bash
ownstack remote -a <app-name>   # create or refresh .ownstack-config
```

You can have multiple `.ownstack-config` files in subdirectories of a monorepo if you deploy multiple apps from one repo.

## Roles

Apps have a `role` (`user` or `system`) and an optional `component_role` for components within a larger system. Most user apps are simply `user`. The role affects which dashboard tabs and operations are exposed.

## Next

- [Stacks](/concepts/stacks/) — where apps run.
- [Deployments](/concepts/deployments/) — how code becomes a running app.
- [Databases](/concepts/databases/) — Postgres, MySQL, and how DATABASE_URL works.
