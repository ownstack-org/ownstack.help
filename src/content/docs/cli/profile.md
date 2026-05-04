---
title: ownstack profile
description: Switch between control planes (hosted vs. self-hosted, multi-account).
---

A **profile** is a saved control-plane endpoint plus an auth token. Each profile lives in `~/.ownstack/profiles.json`.

## List & show

```bash
ownstack profile list      # all saved profiles, with active marker
ownstack profile show      # active profile's API URL + token preview
```

## Switch

```bash
ownstack profile use <name>
```

The `<name>` is whatever you named the profile when logging in. Common pattern: one profile per control plane (e.g. `ownstack` for the hosted instance, `haven` for a self-hosted instance).

## Always check before state-changing commands

The CLI does not warn you when you run `deploy`, `db`, or `ssh` against the wrong profile. Before any command that changes state:

```bash
ownstack profile show
```

The active profile and API URL are printed. If they're wrong, switch first.

## Adding a new profile

```bash
ownstack login                          # creates/refreshes the active profile
ownstack login --api=https://...        # creates a profile pointing at a different control plane
```

Login opens a browser for OAuth; the resulting token is saved.
