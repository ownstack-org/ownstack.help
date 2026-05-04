---
title: ownstack stack
description: Stack management — list, backups, plugins, data, disk usage.
---

The `stack` group covers anything that's about a server (or cluster) rather than an app.

## Listing

```bash
ownstack stacks                    # all stacks in the active account
ownstack stack list                # same
ownstack stack list --json
```

## Plugins

```bash
ownstack stack plugin-install [--stack=NAME] <plugin>
```
Install a dokku plugin on a stack — `letsencrypt`, `redis`, `mysql`, etc. By default uses the linked app's stack.

## Patches

```bash
ownstack stack patches <stack>            # list pending patches
ownstack stack patches apply <stack>      # apply them
```
Common patches include the herokuish fix needed for some buildpack-deployed Ruby/Node apps.

## Data

```bash
ownstack stack data databases <stack>      # list databases on the stack
ownstack stack data volumes <stack> [list|add|remove]   # persistent volumes
```

## Backups

```bash
ownstack stack backup config <stack>       # show backup config
ownstack stack backup run <stack>          # trigger a manual backup
ownstack stack backup list <stack>         # list past backups
```
Configure backup destinations (S3 typically) per-stack in the UI.

## Disk usage

```bash
ownstack stack disk-usage <stack>          # df + dokku container/image disk via SSH
```

## Local stacks

```bash
ownstack stack add-local                   # create a local-dev stack (dokku in Docker)
ownstack local stack start                 # start it
ownstack local stack stop
```
Local stacks are for development — the same deploy + scale workflow as a cloud stack, just on your machine.
