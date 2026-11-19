# Nepal Tourism Atlas — Application Security

## Scope and trust boundaries

The v1 application exposes public pages, developer docs, and a free read-only JSON API. Its request path is internet → TLS reverse proxy → Next.js → PostgreSQL public view. The separate `scrapy_nepal` CLI writes to the ingestion schema. Treat request inputs, crawled values, outbound links, deployment headers, and third-party dependencies as untrusted at their respective boundaries.

The central rule is that a public request can read only reviewed tourism records and fields. It cannot change application state, trigger an import, or instruct the server to fetch an external resource. Keep accounts, credentials, uploads, Server Actions, and admin routes out of v1. If a future change introduces any of them, update the threat model and add authorization at the handler or data-access layer before exposing the feature.

## API inputs and data exposure

- Validate parameters at the route boundary before database access. Enforce the v1 limits on page size, search length, parameter count, and encoded IDs and cursors. Bound encoded tokens before decoding and validate decoded structure and database key types. Use a fixed sort order and keep filter choices explicit.
- Bind every request-derived SQL value. Keep table names, column names, and SQL syntax in reviewed code. Escape SQL pattern metacharacters for the literal substring search documented in v1.
- Use the same approved projection for both list and detail. Serialize fields explicitly. Exclude raw `details` JSONB, crawl runs, internal source metadata, and database errors. An opaque ID identifies a record. The serving view decides whether that record may be returned.
- Serve API payloads as JSON with `X-Content-Type-Options: nosniff`. Keep request IDs bounded and server-generated or supplied by the trusted proxy. Return the documented error shape and keep stack traces, queries, and connection details in protected diagnostics.
- Keep CORS credential-free and scoped to the public API. Preserve `Access-Control-Allow-Origin: *` for intended browser reuse. Apply rate and request limits independently of CORS. Keep database-backed responses and API errors out of shared caches as specified in the API contract.

## Next.js and browser protections

- Run a supported, patched Next.js release and a supported Node.js LTS version. Review advisories for the resolved Next.js, React, and runtime dependencies at build and release time. Production must run a production build with generic public error pages.
- Keep database, secrets, and data access modules marked `server-only`. Pass only deliberately selected public values to Client Components. Review rendered HTML, React Server Component payloads, browser bundles, and any published source maps for accidental disclosure. Never place secrets in `NEXT_PUBLIC_*` or client-facing build configuration.
- Render imported names and localities as text. Keep raw HTML and dataset-driven MDX out of the render path. Accept only verified HTTPS OpenStreetMap links using exact approved hostnames and no embedded credentials. Render them as links. Keep their values out of server-side fetches, image optimizers, navigation redirects, and rewrite destinations.
- Serve reviewed local images. Keep remote image patterns and SVG optimization disabled unless a reviewed requirement calls for them. If a remote provider is added, restrict the protocol, hostname, and path, review redirects, and verify server-side network boundaries.
- Set an enforceable Content Security Policy on the landing page, docs, and data page. Start in report-only mode in staging against the production build, fix unexpected violations, then enforce. Restrict scripts, styles, images, fonts, and connections to what the pages use. Block plugins and framing with `object-src 'none'` and `frame-ancestors 'none'`. Restrict `base-uri` and disable form submission where there are no forms. Keep `unsafe-eval` and blanket inline script allowances out of production.
- If using per-request CSP nonces, configure dynamic rendering for the covered HTML pages using the installed Next.js version's approach. Keep those pages independent of the database. Prevent shared caching of nonce-bearing HTML and scope the nonce logic away from API routes and static assets. If static rendering is required, verify a compatible CSP against the actual production output before adopting it.
- Use HTTPS redirects, `Referrer-Policy: strict-origin-when-cross-origin`, and a narrow `Permissions-Policy` for unused features such as camera, microphone, and geolocation. Enable HSTS at the TLS edge after confirming HTTPS operation. Add `includeSubDomains` or preload only after reviewing the domains affected.

## Availability and reverse proxy

- Expose the TLS reverse proxy publicly. Bind the Next.js origin to loopback or a private interface. Keep PostgreSQL, private readiness probes, and management ports off public ingress. Where a CDN is used, restrict direct origin access so clients cannot bypass edge controls.
- Configure the proxy to accept the production hostname and replace untrusted forwarding headers. Derive client IP only from the configured proxy chain. Build site URLs and redirects from the configured public origin or vetted relative paths.
- Start with the documented 120 requests per minute per client IP for the public API. Also bound burst traffic and total in-flight requests against the single Node process and database pool. Apply appropriate protection to HTML and image routes. Tune limits from staged traffic and preserve the documented `429`, `Retry-After`, and CORS behavior.
- Set practical request-line, header, body, and timeout limits. The public API has no request body requirement. Keep pool acquisition and query timeouts shorter than the outer proxy timeout. Fail quickly and predictably during database saturation. Avoid automatic retries on the public request path.
- Check production-equivalent edge behavior for API errors, Next.js HTML and React Server Component responses, and framework assets. Review any later caching rules for query strings, `Vary` headers, and representations before enabling them.

## PostgreSQL and importer isolation

- Run the app with its dedicated `LOGIN` role. Grant `CONNECT` to the intended database, `USAGE` on `atlas_public`, and `SELECT` on `atlas_public.places_v1`. Verify effective grants through role membership and `PUBLIC`. Keep the runtime role separate from the importer, migration, view-owner, and administrative roles. It must have no direct access to `ingest`, no serving-object write privileges, and no elevated role memberships.
- Use a dedicated non-login view owner with only the underlying privileges required to define and read the view. Use a PostgreSQL security-barrier view where its predicates enforce source visibility. Keep normal view-owner permission semantics so the runtime role can query the view without underlying table grants. Review any functions used by the view and verify query performance after enabling the barrier.
- Schema-qualify SQL objects. Keep the database reachable only over private networking and use certificate-verified TLS for remote connections. Use the documented pool and statement timeouts. Review `pg_hba.conf` and firewall rules together so the database accepts only intended clients.
- Keep app, importer, and operator credentials distinct. Inject them at runtime through the deployment environment or secret store. Keep them out of build artifacts, image layers, version control, diagnostic bundles, and logs. Rotate exposed credentials and inspect related access records.
- Treat a successful import as a separate event from approval for publication. After imports, verify source scope, mapped categories, sample records, and counts in the public view. Review changes to source allowlists or projection SQL as changes to the public data boundary.

## Build, deploy, and respond

- Install from the committed lockfile. Enable dependency and secret scanning in CI. Triage advisories against the deployed dependency versions and address applicable critical and high findings before release. Track the proxy, operating system, PostgreSQL, and container images alongside JavaScript dependencies.
- Give CI only the access its jobs need. Keep deployment secrets restricted to trusted deployment jobs. Run the production process as a non-root user with limited filesystem and network access. Use a reviewed build artifact and retain a known-good patched release for rollback.
- Record request ID, route template, status, latency, and database timing. Exclude credentials, request bodies, raw search terms, complete cursors, and full database errors from routine logs. Restrict log access and set retention. Alert on sustained error rates, rate limiting, slow queries, and pool saturation.
- Keep a short incident procedure with an owner and steps to restrict traffic, disable affected routes, revoke database access, rotate secrets, and restore a known-good release. Preserve relevant logs and review whether any additional data was exposed before restoring service.

## Security release checks

Run these checks in staging with the production build, runtime role, and reverse-proxy configuration.

- The runtime role can query the serving view. It cannot read raw ingestion tables, modify the view's records, or create serving-schema objects. List and detail exclude unapproved records.
- Invalid or oversized input is rejected before database work. Imported strings render as text. API responses and browser artifacts contain only approved fields.
- The proxy enforces hostname, TLS, origin isolation, and request limits. Forwarded headers from clients do not alter trusted client identity. Temporary database failures return bounded errors without exposing internals.
- CSP is enforced and core pages still render, hydrate, and support copy controls. Production headers, CORS, cache behavior, and error responses match the contract.
- Deployed dependencies and infrastructure have an advisory review. The team can identify the running release, locate protected logs, and execute the documented rollback.

## References

- [Next.js data security](https://nextjs.org/docs/app/guides/data-security)
- [Next.js Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)
- [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [Next.js support policy](https://nextjs.org/support-policy) and [security advisories](https://github.com/vercel/next.js/security/advisories)
- [PostgreSQL view privileges and security barriers](https://www.postgresql.org/docs/current/rules-privileges.html)
- [OWASP API Security Top 10](https://api-security.owasp.org/editions/2023/en/0x00-header/) and [OWASP ASVS](https://asvs.owasp.org/)
