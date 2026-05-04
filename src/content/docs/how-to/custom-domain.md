---
title: Add a custom domain
description: Route a custom domain (apex or subdomain) to your OwnStack app, with automatic SSL.
---

OwnStack apps get a default subdomain when deployed (e.g. `<app>.<stack-domain>`). Adding your own domain is a two-step process: register the domain with the app, then point DNS at the stack.

## 1. Add the domain to the app

```bash
ownstack app domains:add <app> example.com
```

This registers the domain with dokku's nginx and (by default) requests a Let's Encrypt cert. You can also pass `--cert=FILE --key=FILE` to use your own cert.

## 2. Point DNS at the stack

The stack has a fixed public IP (visible in `ownstack stacks`). Create the matching DNS record in your provider:

- **Apex** (`example.com`): A record → stack IP.
- **Subdomain** (`app.example.com`): A record → stack IP, or CNAME → stack default domain.

Wildcards (`*.example.com`) work too if you have a wildcard cert or DNS-01 challenge configured.

## 3. Wait for SSL

Once DNS resolves, dokku's letsencrypt plugin auto-issues a cert (HTTP-01 challenge against port 80). Renewal is automatic.

Inspect status:

```bash
ssh dokku@<stack-ip> certs:report <app>
ssh dokku@<stack-ip> letsencrypt:list
```

For wildcard certs (DNS-01 challenge), the per-stack letsencrypt config needs your DNS provider's API credentials — see your stack's documentation.

## Multiple domains, one app

You can attach as many domains as you want — each becomes a `server_name` in nginx. Only one will be the *primary* (used in URLs the app generates); set it via `app domains:add` order or in the UI.

## Removing a domain

```bash
ownstack app domains <app>            # list with IDs
ownstack app domains:remove <app> <id>
```

## See also

- [Domains & SSL](/concepts/domains-and-ssl/) — the underlying model.
