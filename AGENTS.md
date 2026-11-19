<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Nepal Tourism Atlas is a free, read-only Next.js API backed by the existing `scrapy-nepal` PostgreSQL database. Production is `https://atlas.cloveit.com.np`. Public endpoints live under `/api/v1` and developer docs at `/docs/v1`.

Read the relevant context before making changes.

- [Product brief](.agents/PRODUCT_BRIEF.md) — scope and acceptance.
- [Design system](.agents/DESIGN_SYSTEM.md) — landing page and docs UX.
- [System architecture](.agents/SYSTEM_ARCHITECTURE.md) — routing, database access, and deployment.
- [API contract](.agents/API_CONTRACT_V1.md) — HTTP behavior and compatibility.
- [Data and licensing](.agents/DATA_AND_LICENSING.md) — schema verification, provenance, and attribution.
- [Application security](.agents/APPLICATION_SECURITY.md) — trust boundaries, safeguards, and release checks.
- [Implementation and release](.agents/IMPLEMENTATION_AND_RELEASE.md) — build order and verification.

Read Application Security before changing routes, data access, dependencies, browser rendering, or deployment. Treat `scrapy_nepal` as the ingestion owner. Use the restricted runtime role, parameterized SQL, and explicit public fields. Keep secrets server-side. Preserve v1 compatibility and update OpenAPI, examples, and code together. Run relevant checks and report any verification blocked by missing data or environment access.
