---
title: Deployments
description: How code becomes a running app on a stack.
---

A **deployment** is one execution of `ownstack deploy` (or its UI equivalent) for a single app on a single stack. If your app deploys to three stacks, one `ownstack deploy` produces three deployments.

## Lifecycle

1. **Trigger** — `ownstack deploy` from your repo, the UI's "Deploy now" button, or a webhook from GitHub.
2. **Build** — the control plane SSHes to the stack, pushes your repo to dokku, and dokku runs the buildpack (or Dockerfile). Build logs stream back.
3. **Release** — the buildpack's `release` task runs (e.g. `bundle exec rails db:migrate`). If it fails, the deployment fails and the previous version keeps running.
4. **Restart** — dokku starts the new container, runs healthchecks, then rotates traffic.
5. **Post-deploy** — any `postdeploy` script in `app.json` runs (e.g. `bin/rails db:seed`).

## Where to see them

- `ownstack app info` — last deployment SHA per stack.
- `ownstack remote deploy-log` — the full build log for the most recent deployment, or use `--deployment=ID`.
- Dashboard **Deployments** tab — all deployments across all stacks, with status and SHA.

## Multi-stack deploys

When an app is on multiple stacks, `ownstack deploy` enqueues one deployment job per stack. They run in parallel. If one fails, the others continue — you'll see a mix of statuses per-stack in the deployments list.

## Rollback

A rollback is just another deployment with an older SHA. `ownstack deploy <sha>` (when supported) or push the old commit to the deploy ref.

## Pipelines and stages

For staging → production flows, OwnStack supports **pipelines**: an app can have stages, and a deploy promotes between them. See the dashboard's Pipeline tab.
