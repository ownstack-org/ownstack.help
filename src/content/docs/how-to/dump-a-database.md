---
title: Dump a database
description: Stream a binary Postgres or MySQL dump of an app's linked database to a local file.
---

Use `ownstack db dump` to download a binary dump of an app's linked database. The CLI auto-detects Postgres vs. MySQL based on the app's configuration and streams the dump straight to disk — no temp file on the control plane.

## Quick start

```bash
ownstack db dump --app=<app>
```

If the app deploys to multiple stacks you'll be prompted to pick one with `--stack=ID`. The output filename comes from the server (`<app>-<stack>-<timestamp>.dump` for Postgres, `.sql` for MySQL); pass `--output=<path>` to override.

## What format is it?

- **Postgres** — `pg_dump --format=custom`. Restore with `pg_restore`. Compressed by default.
- **MySQL** — `mysqldump`, gzipped. Restore with `gunzip < dump.sql.gz | mysql ...`.

## Restoring locally

```bash
# Postgres
createdb my_local
pg_restore --no-owner --no-acl --dbname=my_local <app>-<stack>-<ts>.dump

# MySQL
gunzip < <app>-<stack>-<ts>.sql | mysql my_local
```

The `--no-owner --no-acl` flags ignore ownership and grants from the source DB so the restore won't fail on missing roles in your local cluster.

## Version compatibility

Postgres custom-format dumps require a `pg_restore` at least as new as the source server. If your source is Postgres 18 (custom format v1.16), you need `pg_restore` 17+. Older `pg_restore` errors with `unsupported version (1.16) in file header`.

On macOS:

```bash
brew install postgresql@18
/opt/homebrew/opt/postgresql@18/bin/pg_restore --list dump-file
```

## Restoring back to the same app

```bash
ownstack db restore --app=<app> --url=<https-url-to-dump>
```

Restores happen on the stack — the CLI hands off to a worker that downloads the dump and runs `dokku postgres:import` (or `mysql:import`). Track progress with `ownstack db restores` and `ownstack db restore:info <ID> --follow`.

## See also

- [`ownstack db` reference](/cli/db/)
- [Repair a database link](/how-to/repair-database-link/) — for when DATABASE_URL drifts from the role password after an import.
