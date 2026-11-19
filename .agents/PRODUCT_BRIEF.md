# Nepal Tourism Atlas — Product Brief

## Product

- Repository name — `Nepal-Tourism-Atlas`
- Public name — Nepal Tourism Atlas
- Release — `v1`
- Production origin — `https://atlas.cloveit.com.np`
- API base — `https://atlas.cloveit.com.np/api/v1`
- Developer docs — `https://atlas.cloveit.com.np/docs/v1`
- `घुम्ती (Ghumti)` is a working brand idea. Use Nepal Tourism Atlas in public copy and metadata until the owner confirms a brand change.

## Who it serves

The primary users are developers, students, and researchers who need structured Nepal tourism data for applications, coursework, or analysis. A first-time visitor should be able to identify what the data covers, send a request without creating an account, understand the response, and find the reuse terms.

Position the project as a developer resource for discovering tourism-related places in Nepal. Its data includes destinations, accommodation, food, heritage, parks, transport, and trails. Coverage depends on what contributors mapped and what the importer collected. A trail record does not establish that the API has its full route geometry or current conditions.

## Existing data

`scrapy_nepal` is a separate Python CLI that collected and imported the data. The owner verified 68,542 real OpenStreetMap records in the existing import and removed demo rows. That number describes the verified import. Use a fresh count against the approved public dataset before displaying any public coverage statistic, and label its date and scope.

## v1 scope

- A landing page that explains the project, shows a working quickstart, and links to the docs.
- A free, unauthenticated, read-only API for listing places, retrieving a place by ID, and discovering supported categories.
- Versioned docs with copyable requests, response examples, pagination, errors, rate limits, and licensing.
- OpenAPI JSON and a public data sources and licensing page.

Keep accounts, API keys, write endpoints, admin screens, bookings, itinerary planning, maps, route geometry, and external API calls outside the v1 implementation. Add coordinates or spatial search only through a separately approved contract change backed by verified source fields.

## Acceptance criteria

A visitor can open the docs, run the quickstart, take an ID from the list response, and retrieve that place. A developer can finish a paginated query and find attribution and reuse guidance without contacting the team. Landing copy describes the actual categories, access model, and coverage.
