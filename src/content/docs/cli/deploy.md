---
title: ownstack deploy
description: Trigger a deployment — git push or image-based.
---

```
ownstack deploy [APP] [--stack=NAME] [--wait] [--image [TAG]]
```

Deploys the linked (or named) app to one or more stacks via the control plane.

## Common forms

```bash
ownstack deploy                              # deploy linked app to all its stacks
ownstack deploy my-app                       # deploy a specific app
ownstack deploy --stack=production           # deploy only to one stack
ownstack deploy --image                      # deploy from a registry image instead of git
ownstack deploy --image=my-registry:my-tag   # specific image:tag
```

## How it works

1. The CLI hands the app + stack to the control-plane API.
2. The control plane enqueues one **deployment job per stack** the app is configured for.
3. Each job SSHes to its stack, pushes your repo (or pulls the image), and lets dokku run the build + release + restart.
4. Build logs stream back; the CLI prints status when the job completes.

## `--wait` / streaming logs

By default the CLI returns once the deploy is queued. `--wait` streams the build log live until the deploy succeeds or fails. Skip `--wait` if you don't need to babysit it — check status with:

```bash
ownstack remote deploy-log [--app=NAME] [--deployment=ID]
```

## Multi-stack apps

If the app deploys to multiple stacks, all are deployed in parallel. Per-stack status lands in the **Deployments** dashboard tab; one job's failure doesn't cancel the others.

## Git remotes

If you prefer raw `git push`, the per-stack dokku git remote is available — see `ownstack remote -h` for the names — but going through `ownstack deploy` gives you logging, retries, and multi-stack support automatically.
