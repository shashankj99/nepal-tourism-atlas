# Nepal Tourism Atlas — System Architecture

## Architecture

Use one TypeScript Next.js App Router application and the existing PostgreSQL database. Next.js serves the landing page, docs, OpenAPI document, and public API. The Python CLI remains responsible for ingestion and its migrations. The web app reads the database in the Node.js runtime through `pg` and parameterized SQL.

Keep the request path small. The route handler validates input and sets HTTP headers. The query module fetches explicitly named columns from the public projection. The response mapper serializes public fields. Share database access across routes. Add another service, ORM, queue, or cache only when a concrete requirement calls for it.

## Suggested application layout

```text
src/
  app/
    page.tsx
    data/page.tsx
    docs/v1/page.tsx
    api/v1/places/route.ts
    api/v1/places/[id]/route.ts
    api/v1/categories/route.ts
    api/v1/openapi.json/route.ts
  server/
    db/pool.ts
    places/queries.ts
    places/serialize.ts
  lib/
    api/v1/
  components/
```

Adapt the layout to the repository if it already uses `app/` at the root. Use `GET` Route Handlers for data endpoints, and `page.tsx` for rendered pages. Treat `v1` as a literal path segment. Verify route parameters and caching behavior against the installed Next.js version. Keep database modules server-only and out of Client Component imports. Landing, docs, and the OpenAPI document should build without connecting to PostgreSQL.

## Database boundary

Use a normal view named `atlas_public.places_v1` as the database-facing contract. A reviewed setup script owned by the database operator should create the schema, the view, and the restricted application role. Keep these objects separate from the importer's migrations.

The view should filter to approved source IDs and expose only the composite key and public fields needed by the API. Preserve the actual key types. Put the raw-to-public category mapping in one place and use the same projection for list and detail. Preserve the import tables and their primary key.

Grant the app role access to the database and `USAGE` on the serving schema and `SELECT` on the view. Give it no direct access to the raw `ingest` schema or authority to create or modify database objects. Use a dedicated, non-login owner for the view with only the underlying reads it needs. Verify effective permissions, including inherited grants and grants to `PUBLIC`. Apply setup SQL explicitly with an operator account after schema inspection.

## Pooling and performance

- Use one lazy `pg.Pool` per running process. Reuse it across handlers and development hot reloads. Use `pool.query()` for single statements. If a transaction needs a checked-out client, release it in `finally`.
- For a single Node process, start with `max: 5`, a 2-second connection timeout, and a 30-second idle timeout. Set a role-level `statement_timeout` starting around 3 seconds. Tune from staging measurements.
- Budget total connections as app processes × pool maximum. Reserve capacity for importer jobs, administration, and overlapping deployment processes. Reassess the pool before introducing autoscaling or PgBouncer.
- Use the existing composite key for detail lookups and keyset pagination. Inspect real plans for filtered lists. Add targeted indexes through an owner-reviewed change when measurements justify them. Consider `pg_trgm` for substring search if search becomes slow and the deployment supports the extension.
- Start with `Cache-Control: no-store` for database-backed responses and errors. Allow the static OpenAPI document to be cached briefly. Introduce data caching only after checking how updates, canonical query keys, and rate limiting interact.

## Deployment

Start with one long-running Node deployment behind a TLS reverse proxy. Keep PostgreSQL on a private network. Use the Docker service hostname when Next.js shares that network, or a private or loopback connection when it runs on the host. Use verified TLS for remote database connections where required by the deployment.

Read `DATABASE_URL` server-side from the environment. Keep real credentials out of git, `NEXT_PUBLIC_*` variables, logs, and browser bundles. Put placeholder names in `.env.example`. Use trusted proxy configuration for client IP detection. See [IMPLEMENTATION_AND_RELEASE.md](IMPLEMENTATION_AND_RELEASE.md) for runtime checks.

References — [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) · [node-postgres pool sizing](https://node-postgres.com/guides/pool-sizing) · [PostgreSQL views](https://www.postgresql.org/docs/current/sql-createview.html) · [PostgreSQL trigram indexes](https://www.postgresql.org/docs/current/pgtrgm.html)
