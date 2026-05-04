---
title: Scale processes
description: Change the number of running containers per process type for an app on a stack.
---

OwnStack apps run one or more **process types** declared in the repo's `Procfile` — typically `web`, `worker`, and any number of background-queue processes. Scaling means changing how many container instances each process type runs.

## Quick reference

```bash
# Coming soon: ownstack ps:scale <app> worker=2
# For now, ssh into the stack:
ssh dokku@<stack-ip> ps:scale <app> worker=2 web=1
```

This changes scale immediately. Containers spin up or down to match.

## A note about `app.json` and the `formation` block

Dokku honors a `formation` block in `app.json` as **authoritative state** — when present, manual `dokku ps:scale` is blocked entirely with this error:

> App `<name>` contains an app.json file with a formations key and cannot be manually scaled

This is dokku's default behavior, not OwnStack's. Heroku interprets `formation` as initial *defaults* for review apps and Heroku Button-deployed apps. Dokku interprets it as a lock.

### How to fix

You have two options:

**(1) Remove the `formation` block from `app.json`.** Recommended unless you actively rely on it for Heroku review apps. Dokku will then accept manual scaling and use its own per-stack scale state.

**(2) Point dokku at a different file** that doesn't have the `formation` block — e.g. an `app.dokku.json` you also commit to your repo:

```bash
ssh dokku@<stack-ip> app-json:set <app> appjson-path app.dokku.json
```

Heroku continues to read `app.json` (with `formation`); dokku reads `app.dokku.json` (without). Manual scaling unblocked. The downside is duplication between the two files — keep them in sync for non-`formation` keys.

## Multi-stack apps

Each stack has its own scale state. If your app deploys to stacks A and B, scale them independently:

```bash
ssh dokku@<stack-A-ip> ps:scale <app> worker=2
ssh dokku@<stack-B-ip> ps:scale <app> worker=4
```

Don't try to centralize via `app.json` formation — see above for why dokku interprets that as a lock.

## What about a Heroku-style `ownstack ps:scale`?

It's coming. See the [tracking issue](https://github.com/ownstack-org/control-plane/issues/294) — the planned UX is `ownstack ps:scale <app> worker=2` and matching UI controls, hiding all the dokku quirks. Until then, the `ssh dokku@... ps:scale` flow above is the path.
