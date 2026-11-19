# Nepal Tourism Atlas

A free, read-only Next.js API for browsing tourism places in Nepal and discovering
the v1 category vocabulary.

## Run locally

This slice was developed using the installed Node.js 26.4.0.

```sh
npm ci
npm run dev
```

Open [the landing page](http://localhost:3000), [developer docs](http://localhost:3000/docs/v1),
or [data and licensing](http://localhost:3000/data).

```sh
curl 'http://localhost:3000/api/v1/places?limit=3'
curl 'http://localhost:3000/api/v1/categories'
curl 'http://localhost:3000/api/v1/openapi.json'
```

The landing page, docs, and category directory work without PostgreSQL. The places
endpoint returns `503 SERVICE_UNAVAILABLE` until the serving view and credentials
are configured.

## Connect the places endpoint

1. Review [data preflight](.agents/DATA_AND_LICENSING.md#preflight) and the
   source allowlist and category mapping in [db/places-v1.sql](db/places-v1.sql).
2. Review PostgreSQL's effective `PUBLIC` grants with the database operator.
   The setup script rolls back if the runtime role can create database objects,
   including temporary tables. PostgreSQL grants `TEMPORARY` to `PUBLIC` by default.
   Identify existing roles that rely on it and preserve their access when adjusting
   that database grant. Review the other privilege checks in the setup script as well.
3. Run `psql -d scrapy-nepal -f db/places-v1.sql` through the operator connection.
   The script creates the serving schema, view, and two dedicated roles in one
   transaction. Provision a password for `atlas_runtime` with the operator's
   secret workflow, for example with `\password atlas_runtime` in an interactive psql session.
4. Copy `.env.example` to `.env.local` and set the runtime connection URL.
   The local Docker container publishes PostgreSQL on port `5433`. Configure
   certificate-verified TLS for remote connections.

The view excludes unmapped categories and unreviewed sources. The checked local
import includes the Geofabrik Nepal snapshot and route records. Displayed locality
comes from the stored import area. Trail records provide basic place fields only.

## Verify

```sh
npm run lint
npm run build
```

The production origin is `https://atlas.cloveit.com.np`. The release checklist
covers reverse-proxy limits and staging verification before that origin serves
the API. Configure the proxy to return the v1 method error for requests such as
`TRACE` that Next.js rejects before the route handler. See
[implementation and release](.agents/IMPLEMENTATION_AND_RELEASE.md).
