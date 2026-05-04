---
title: Databases
description: Postgres, MySQL, and how DATABASE_URL ties everything together.
---

OwnStack apps can have one or more **linked databases**: Postgres, MySQL, MongoDB (for some app types), or Redis for caching/queues. Each database is a dokku service running on the stack — its data lives on the stack's disk.

## DATABASE_URL

Linking a postgres or mysql service to an app sets `DATABASE_URL` (and `DOKKU_POSTGRES_*_URL` aliases for postgres) as a config var on the app. Your app reads it at runtime.

```
postgresql://postgres:<password>@dokku-postgres-<service>:5432/<dbname>
```

The host is dokku's internal docker network alias; the port is always 5432 inside the stack.

## Creating a database

```bash
ownstack db create --app=<app> [--version=17]
```

This creates `postgres-<app>` (or whatever name you choose), starts it, links it to the app, and refreshes `DATABASE_URL`. After this lands, redeploy the app to pick up the env change.

## Multiple databases per stack

A single stack can host as many databases as you have disk for. Most apps have one Postgres and optionally a Redis. Larger systems sometimes split read/write or per-tenant — OwnStack doesn't impose a limit.

## Inspecting state

- `ownstack db check` — connectivity + auth, surfaces password drift.
- `ownstack db status` — running/stopped state.
- `ownstack db version` — Postgres version.
- `ownstack stack data databases <stack>` — every database on a stack.

## Drift and repair

Postgres role passwords and `DATABASE_URL` can drift apart in a few specific scenarios — most commonly when you import a database from a `pg_dumpall` (which carries `ALTER ROLE ... WITH PASSWORD` in the dump). When this happens, deploys fail with `password authentication failed for user "postgres"`.

The fix is one SQL statement that aligns the postgres role's password to whatever `DATABASE_URL` claims. See [Repair a database link](/how-to/repair-database-link/).

## Backups & dumps

- **Manual dump** — `ownstack db dump --app=<app> --output=<file>` streams a binary `pg_dump` (Postgres custom format) or `mysqldump` to a local file.
- **Scheduled backups** — configured per-stack under **Stack → Backups**. Stored in object storage you configure (typically S3).
- **Restore from a backup** — `ownstack db restore --url=<dump-url>` or the UI's **Data → Restore from backup**.

See [Dump a database](/how-to/dump-a-database/) for the workflow.
