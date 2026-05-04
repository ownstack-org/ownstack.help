---
title: Install the CLI
description: Install ownstack on macOS or Linux, then authenticate with your account.
---

The OwnStack CLI is a single executable plus a few helper scripts. macOS and Linux are supported; Windows users should use WSL.

## Install

```bash
curl -sSL https://ownstack.org/cli/install.sh | bash
```

This drops the `ownstack` binary into `~/bin` (or another directory on your `PATH`) and pulls the lib scripts to `~/.ownstack/cli`.

Verify:

```bash
ownstack --version
```

## Authenticate

The CLI talks to a **control plane** (the hosted one at `api.ownstack.org` by default, or your self-hosted instance). You authenticate per-control-plane via a **profile**.

```bash
ownstack login
```

This opens a browser, completes OAuth against the control plane, and saves a token to `~/.ownstack/profiles.json`. The active profile is shown by:

```bash
ownstack profile show
```

If you work against multiple control planes (e.g. a hosted account and a self-hosted instance), switch with:

```bash
ownstack profile use <name>
```

Always check the active profile before any command that affects state — `deploy`, `db`, `ssh`, etc. The output above lists which control plane you're talking to.

## Next

You're ready to [deploy your first app](/getting-started/first-app/).
