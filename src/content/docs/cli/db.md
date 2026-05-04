---
title: ownstack db
description: Database commands — check, repair, dump, restore, lifecycle.
---

The `db` command group covers Postgres and MySQL operations on your apps' linked databases.

## Health

```bash
ownstack db check [--app=NAME] [--stack=STACK]
```
Verify connectivity and authentication. Surfaces password drift between `DATABASE_URL` and the postgres role.

```bash
ownstack db repair [--app=NAME] [--stack=STACK]
```
Re-link the DB, refresh `DATABASE_URL`, and resync the postgres role's password against dokku's stored DSN. Restarts the app afterward. See [Repair a database link](/how-to/repair-database-link/) for when this is the right tool vs. when it isn't.

```bash
ownstack db reset-password [--app=NAME] [--stack=STACK]
```
Alias for `db repair`. Same behavior.

```bash
ownstack db version [--app=NAME]
ownstack db status  [--app=NAME]
ownstack db logs    [--app=NAME]
```

## Dump

```bash
ownstack db dump [--app=NAME] [--stack=ID] [--output=FILE]
```
Stream a binary dump of the app's linked database to a local file. Postgres → custom format (`.dump`). MySQL → gzipped SQL (`.sql`). Auto-detects type. See [Dump a database](/how-to/dump-a-database/).

## Heroku-style backups (for Heroku-imported apps)

```bash
ownstack db backups --heroku-app=NAME [--app=NAME]
ownstack db backups:capture --heroku-app=NAME [--app=NAME]
```

## Restore

```bash
ownstack db restore --heroku-app=NAME [--backup=NUM]
ownstack db restore --url=URL [--app=NAME]
ownstack db restore:info ID [--app=NAME] [--follow]
ownstack db restore:cancel ID [--app=NAME]
ownstack db restores [--app=NAME]
```

## Lifecycle

```bash
ownstack db create [--app=NAME] [--version=17]
ownstack db destroy [--app=NAME] [--force]
ownstack db recreate [--app=NAME] [--version=17]
ownstack db link [--app=NAME]
```

`recreate` destroys and re-creates fresh — useful when starting over on a development stack. Never use it on prod.
