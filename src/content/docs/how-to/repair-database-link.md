---
title: Repair a database link
description: Fix `password authentication failed for user "postgres"` after a database import or password rotation.
---

If deploys (or release tasks) suddenly fail with:

```
PG::ConnectionBad: connection to server at "..." port 5432 failed:
FATAL:  password authentication failed for user "postgres"
```

your app's `DATABASE_URL` and the postgres role's actual password are out of sync.

## When does this happen?

The most common cause is restoring a database from a `pg_dumpall` (cluster-wide dump). That dump format includes `ALTER ROLE postgres WITH PASSWORD '...'` statements, which override whatever password dokku originally set. Your app still has the *old* `DATABASE_URL`; the database role accepts only the *new* password from the dump.

Less common: someone ran `dokku postgres:reset-password` or manually changed credentials.

## The fix

Align the postgres role's password to whatever `DATABASE_URL` claims (or vice versa).

```bash
# 1. Read the current DATABASE_URL on the stack
ssh dokku@<stack-ip> config:get <app> DATABASE_URL
# postgresql://postgres:<password>@dokku-postgres-<service>:5432/<dbname>

# 2. Sync the role password to match
printf "ALTER ROLE postgres WITH PASSWORD '<password from above>';\n\\q\n" | \
  ssh dokku@<stack-ip> postgres:connect <service>
```

The `ALTER ROLE` will print `ALTER ROLE` on success. Retry your deploy — release tasks now authenticate.

## Why not `ownstack db repair`?

The current `ownstack db repair` (alias `db reset-password`) syncs the role's password to dokku's stored service DSN, not to the app's `DATABASE_URL`. For drift caused by a dump import, the service DSN itself is sometimes out of sync with `DATABASE_URL`, so `db repair` aligns the role to the wrong target.

This is a known sharp edge — see the [tracking issue](https://github.com/ownstack-org/control-plane/issues/289). For now, the manual `ALTER ROLE` above is the reliable fix.

## See also

- [Databases](/concepts/databases/) — how `DATABASE_URL` is derived and the dokku service model.
- [Dump a database](/how-to/dump-a-database/) — the right way to back up.
