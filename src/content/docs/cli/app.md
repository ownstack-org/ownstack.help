---
title: ownstack app
description: App management — list, info, stacks, domains, lifecycle.
---

The `app` command group covers everything about an app's metadata, deploy targets, and domains.

## Listing & info

```bash
ownstack app list
ownstack app info [APP]
```
`app list` shows all apps in the active account; `app info` shows status, primary domain, and current deployed SHA per stack.

## Deploy targets (multi-stack)

An app can be deployed to one or more stacks.

```bash
ownstack app stacks <app>                # list stacks the app is on
ownstack app stacks:add <app> <stack>    # add a deploy target
ownstack app stacks:remove <app> <stack> # remove
```

## Domains

```bash
ownstack app domains <app>
ownstack app domains:add <app> example.com [--cert=FILE --key=FILE]
ownstack app domains:remove <app> <id>
```
See [Add a custom domain](/how-to/custom-domain/).

## Build & app type

```bash
ownstack app build-type <app> [dockerfile|herokuish]
ownstack app autodeploy <app> [on|off]
ownstack app purge-cache <app>
ownstack app unlock <app>
```

## Cloning & replicating

```bash
ownstack app clone <source> <new-name> [--stack=NAME] [--domain=DOMAIN] [--deploy]
ownstack app replicate <source> <new-name> [--stack=NAME] [--domain=DOMAIN] [--deploy]
```
- `clone` — independent copy with its own DB.
- `replicate` — shares DB and Redis with the source.

## Database link repair

```bash
ownstack app repair-db postgres|mysql [APP] [--stack=NAME] [--check-only]
```
Equivalent to `ownstack db repair` (with explicit `--check-only`). See [Repair a database link](/how-to/repair-database-link/).

## SSH

```bash
ownstack ssh app <app> [--stack=NAME]    # interactive container shell (dokku enter)
ownstack ssh stack <stack>               # shell on the stack host
```

## Linking the local repo

```bash
ownstack remote -a <app>     # write .ownstack-config in cwd, linking subsequent commands to <app>
ownstack remote              # show what's linked
```
