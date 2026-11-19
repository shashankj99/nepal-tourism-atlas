# Nepal Tourism Atlas — Implementation and Release

## Build sequence

1. Inspect the existing Git repository, package manager, Next.js version, importer migrations, and available database connection. Use the checked-in lockfile. If the repository is empty, scaffold a TypeScript App Router app on a supported Next.js release, then commit its lockfile. Keep the app build independent of a live database connection.
2. Confirm the data preflight in [DATA_AND_LICENSING.md](DATA_AND_LICENSING.md). Prepare and review the serving view and role setup. Document the exact local connection path for Next.js and the existing Docker PostgreSQL instance.
3. Implement validators, ID and cursor encoding, SQL queries, serializers, and the API routes. Verify the route behavior through HTTP using the runtime role.
4. Publish the versioned OpenAPI document and docs. Build the landing page and data page. Use the same route paths, examples, and terminology across the site.
5. Test in staging through the real reverse proxy, then run the production smoke checks after DNS and TLS are ready.

## Runtime operations

- Start with a configurable limit of 120 requests per minute per client IP across the public API, then tune from observed traffic. Enforce it at the reverse proxy or gateway. Test the intended response and `Retry-After`. Keep proxy-generated errors consistent with the API contract. Configure trusted upstream proxy addresses before relying on forwarded client IP headers.
- Log request ID, route template, status, latency, and database timing. Avoid logging connection strings, secrets, raw search terms, and complete cursor values. Monitor `429`s, `5xx`s, pool wait, and slow queries.
- Use a lightweight process probe and a bounded private database readiness check in production. Keep those endpoints outside the versioned public contract and expose only the information needed by the deployment.
- Document how `scrapy_nepal` updates data and how the team verifies the public projection afterward. Confirm backup and restore ownership for the existing database. Keep app rollback separate from importer migration or data rollback.

## Verification

- Run lint, type checks, and the production build using the repository's scripts. Validate the OpenAPI document and compare example payloads with actual responses.
- Test default listing, empty results, valid filters, duplicate and invalid parameters, literal search wildcards, Devanagari names, nullable fields, malformed IDs, unknown IDs, and multiple cursor pages. On a fixed dataset, verify stable ordering without skipped or duplicated rows.
- Test that unapproved sources remain inaccessible through both list and detail. Verify the app role cannot read the underlying ingest tables or write to the serving view.
- Test endpoint and proxy behavior for `HEAD`, `OPTIONS`, unsupported methods, rate limiting, and a temporary database outage. Check CORS and request IDs on relevant responses.
- Review mobile layout, keyboard operation, focus visibility, reduced motion, image crops, and copy controls. Test the quickstart from the public docs without signing in.
- Confirm public attribution, source terms, approved assets, and any required machine-readable data offer before launch. Verify that the public count, if displayed, comes from the approved projection with an as-of date.
