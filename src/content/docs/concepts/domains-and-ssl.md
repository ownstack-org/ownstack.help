---
title: Domains & SSL
description: How OwnStack routes custom domains to apps and provisions Let's Encrypt certificates.
---

Each app gets a default subdomain on its stack (e.g. `<app>.<stack-domain>`). Custom domains are added per-app and routed through the stack's nginx layer.

## Adding a domain

```bash
ownstack app domains:add <app> example.com [--cert=FILE --key=FILE]
```

After adding, point your DNS at the stack's IP (A record for apex, CNAME or A for subdomains). The control-plane web UI shows which DNS targets to use.

## Let's Encrypt

If you don't pass `--cert` and `--key`, OwnStack will provision a Let's Encrypt cert via the dokku letsencrypt plugin once DNS resolves to the stack. Renewals are automatic.

For wildcard certs (e.g. `*.havenhelix.com` covering many subdomains), the cert is requested DNS-01 style — see your stack's letsencrypt plugin config for the DNS provider hookup.

## Multi-stack apps

Each stack has its own nginx + cert. If the same custom domain serves traffic from multiple stacks (load-balanced), each stack independently provisions its cert.

## Inspecting state

- `ownstack app domains <app>` — list domains attached.
- `ssh dokku@<stack-ip> certs:report <app>` — current cert details (issuer, expiry, hostnames).
- `ssh dokku@<stack-ip> letsencrypt:list` — apps with letsencrypt-managed certs and renewal timing.
