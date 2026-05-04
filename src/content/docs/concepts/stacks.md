---
title: Stacks
description: A stack is the server (or cluster) where your apps run. You own the host; OwnStack manages the layer above it.
---

A **stack** is a server (or cluster) that runs apps. You own the underlying host — it's in your AWS account, your GCP project, or any provider you have SSH access to. OwnStack provisions and configures the dokku layer on top.

## Provider types

- **AWS** — EC2 instance(s) provisioned via your AWS credentials.
- **GCP** — GCE instance(s).
- **OpenStack** — for private clouds.
- **SSH** — bring-your-own-host. You give OwnStack an IP and an SSH key; it does the rest.
- **Local** — a dokku container running on your machine via `ownstack local stack start`. For development.

## What's on a stack

Every provisioned stack runs:

- **dokku** — the underlying PaaS engine.
- **The standard plugins** — postgres, mysql, redis, mongo, letsencrypt, http-auth.
- **Nginx** — already managed by dokku for routing and SSL.
- **An SSH endpoint** — used by the control plane to push deploys, run scale commands, fetch logs, etc.

## Provisioning

Stacks are created in the web UI (**Stacks → New**) — choose a provider, add credentials, pick a region, hit provision. You can also import an existing dokku host as an `ssh` stack and skip provisioning.

`ownstack stacks` lists what you have. `ownstack stack data databases <stack>` shows the databases on a stack.

## Scaling stacks

A single stack can host many apps. As load grows you have two paths:

- **Vertical** — bigger instance type. Provisioned in your cloud account; OwnStack respects whatever you set there.
- **Horizontal** — multiple stacks, with apps deployed to several of them. Combined with a load balancer (often the cloud provider's), you get a multi-host setup.

## Backups

Each stack supports manual and scheduled backups via `ownstack stack backup`. Backups capture databases and persistent volumes. See the **How-to** section for the full workflow.

## Next

- [Apps](/concepts/apps/) — what runs on a stack.
- [Deployments](/concepts/deployments/) — how code lands on a stack.
