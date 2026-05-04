---
title: CLI overview
description: The `ownstack` command — how it's organized, conventions, and where to find each subcommand.
---

The `ownstack` CLI is the primary driver for the OwnStack platform. Every UI action has a CLI equivalent; many CLI commands have no UI equivalent (yet).

## Anatomy

```
ownstack <command> [<subcommand>] [options]
```

Top-level commands group around resources: `app`, `db`, `stack`, `deploy`, `profile`, etc. Each may have subcommands (`db dump`, `app stacks`, `stack backup run`).

## Common flags

| Flag | Purpose |
|---|---|
| `--app=NAME` | Target a specific app. Defaults to the linked app in `.ownstack-config`. |
| `--stack=NAME_OR_ID` | Target a specific stack. Required when multiple stacks are deployable. |
| `--json` | Machine-readable output where supported. |
| `--help` / `-h` | Per-command usage. |

## Profiles & control planes

The CLI talks to a **control plane**. The active profile selects which one — hosted (`api.ownstack.org`) or your self-hosted instance.

```bash
ownstack profile list
ownstack profile show
ownstack profile use <name>
```

Always check the active profile before any state-changing command.

## Reference index

- [`ownstack app`](/cli/app/) — list, show, manage app metadata, stacks, domains.
- [`ownstack deploy`](/cli/deploy/) — deploy via git or image.
- [`ownstack db`](/cli/db/) — databases: check, repair, dump, restore, link, recreate.
- [`ownstack stack`](/cli/stack/) — list, backup, query stack-level data.
- [`ownstack profile`](/cli/profile/) — control plane profiles.

## Top-level help

```bash
ownstack help
```

Always shows the current set of commands available in your installed CLI.
