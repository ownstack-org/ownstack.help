---
title: Deploy your first app
description: From `git init` to a live URL on a stack you own.
---

This walks through deploying a small Node.js or Rails app end-to-end. The same shape works for Python, Go, Ruby, PHP, anything dokku-compatible (which is essentially anything that runs on Heroku).

## Prerequisites

- The CLI [installed](/getting-started/install/) and authenticated.
- At least one **provisioned stack** in your account. Create one in the web UI (Stacks → New) or via `ownstack stack add-local` for local development. Cloud stacks live in your AWS or GCP account.
- A git repo to deploy. If you don't have one handy, scaffold a tiny app:

  ```bash
  mkdir hello && cd hello
  git init
  echo "web: node -e 'require(\"http\").createServer((_,r)=>r.end(\"hello\")).listen(process.env.PORT)'" > Procfile
  echo '{"name":"hello","scripts":{"start":"node index.js"}}' > package.json
  git add . && git commit -m initial
  ```

## 1. Register the app

```bash
ownstack app create hello --stack=<stack-name>
```

The control plane creates the dokku app on the stack, generates an SSH-based git remote, and writes `.ownstack-config` in your repo so subsequent commands know which app to talk to.

## 2. Deploy

```bash
ownstack deploy
```

This pushes your code to the stack via the control plane, runs the buildpack, and starts the `web` process from your Procfile. You'll see the build log; if anything fails the CLI prints the error and the URL to view the full log.

## 3. View it

```bash
ownstack app info
```

Shows status, the assigned subdomain (`<app>.<stack-domain>`), and links to logs and the dashboard. Hit the URL in your browser.

## What's next

- **Custom domain** — see [Add a custom domain](/how-to/custom-domain/).
- **Add a database** — `ownstack db create` provisions Postgres, links it, and sets `DATABASE_URL`.
- **Scale processes** — once you have background workers, see [Scale processes](/how-to/scale-processes/).
- **Tail logs** — `ownstack remote logs --tail 100 --follow`.
