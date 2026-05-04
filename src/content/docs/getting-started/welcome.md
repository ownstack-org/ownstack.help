---
title: Welcome
description: What OwnStack is, why it exists, and how the pieces fit together.
---

OwnStack is a control plane for deploying apps onto **stacks you own** — your AWS account, GCP project, or any Linux host with SSH. It gives you the workflow of a managed PaaS (`git push` to deploy, `ownstack ps:scale worker=2`, add-ons, automatic SSL) without the lock-in or per-dyno markup.

Under the hood, each stack runs [dokku](https://dokku.com/) — a battle-tested PaaS toolkit. OwnStack is the layer above: it handles authentication, multi-stack orchestration, the control-plane API, the CLI, the web UI, and the dokku quirks you'd otherwise have to learn.

## How the pieces fit

- **Control plane** — central service (`api.ownstack.org` for hosted, or self-hosted) that holds your account, your stacks, your apps, and runs the deploy worker.
- **Stack** — a server (or cluster of servers) that runs your apps. Each stack lives in your cloud account; OwnStack provisions it via SSH.
- **App** — what you'd call an "app" anywhere else. Code in a repo, a Procfile, environment variables, optional databases. Apps deploy to one or more stacks.
- **CLI** — `ownstack` — the everyday driver for deploying, scaling, viewing logs, managing config.
- **UI** — web dashboard at the control plane URL, mirrors the CLI.

## What's next

If you're new, work through these in order:

1. [Install the CLI](/getting-started/install/) — five minutes.
2. [Deploy your first app](/getting-started/first-app/) — fifteen minutes end-to-end, from `git init` to a live URL.

If you're already running and want a specific answer, jump to [How-to guides](/how-to/scale-processes/) or the [CLI reference](/cli/overview/).
