# Nepal Tourism Atlas — API Contract v1

Base URL — `https://atlas.cloveit.com.np/api/v1`  
Developer docs — `https://atlas.cloveit.com.np/docs/v1`  
Access — public, free, no API key

## Endpoints

| Method | Path            | Behavior                                                  |
| ------ | --------------- | --------------------------------------------------------- |
| `GET`  | `/places`       | List places with optional filters and cursor pagination   |
| `GET`  | `/places/{id}`  | Retrieve a single place by opaque public ID               |
| `GET`  | `/categories`   | List the stable v1 category vocabulary and display labels |
| `GET`  | `/openapi.json` | Serve the OpenAPI 3.1 document for v1                     |

Use `destination`, `accommodation`, `food`, `heritage`, `park`, `transport`, and `trail` as the proposed public category keys. Confirm the mapping against the actual import before locking the contract. The categories endpoint returns the vocabulary without promising that every category has records or returning live counts.

## List parameters

| Parameter  | Format and behavior                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| `q`        | Trimmed string, 3–100 Unicode code points. Case-insensitive literal substring of `name`.             |
| `category` | One supported category key.                                                                          |
| `locality` | Trimmed string, 1–100 Unicode code points. Case-insensitive exact match against the stored locality. |
| `limit`    | Decimal integer from 1 to 100. Default 25.                                                           |
| `cursor`   | Opaque token from the previous page.                                                                 |

Combine filters with AND. Reject duplicate or unknown query parameters, blank values, and out-of-range input with `400`. Use bound SQL parameters. Escape SQL pattern metacharacters in `q` so `%`, `_`, and the escape character are treated literally. Search behavior follows the database's configured case rules. Document that v1 does not provide transliteration, accent folding, relevance ranking, or fuzzy matching.

## Identity and pagination

Generate deterministic public IDs from a canonical, URL-safe base64url encoding of the UTF-8 JSON tuple `[sourceId, externalId]`, with both values represented as strings. Preserve the original key values losslessly and freeze this encoding within v1. Document IDs as opaque. Validate size, UTF-8, structure, canonical encoding, and actual identifier types before querying. Set and test a size bound that fits every verified source key. Malformed IDs return `400`. Well-formed IDs outside the public projection return `404`.

Order results by `(source_id, external_id)` in ascending order using the database column types and a consistent ordering. Apply a keyset comparison using the same types. Fetch `limit + 1` rows and derive the next cursor from the last returned row only when another row exists.

Encode cursors using a versioned base64url payload with the last key tuple and a fingerprint of the normalized filters. Validate size, structure, key types, version, and filter fingerprint. Return `400 INVALID_CURSOR` for an invalid or mismatched cursor. The page size may change between requests. Cursors describe a position in the ordered dataset. Imports can change the results between pages.

## Response shape

| Field       | Public representation                                         |
| ----------- | ------------------------------------------------------------- |
| `id`        | Opaque string                                                 |
| `name`      | String or `null`                                              |
| `category`  | Supported v1 key                                              |
| `locality`  | String or `null`                                              |
| `source`    | Object with `key: "openstreetmap"` and `url: string \| null`  |
| `updatedAt` | UTC ISO 8601 string or `null`, describing the imported record |

- List — `{ "data": [...], "meta": { "limit": 25, "nextCursor": null, "attributions": [...] } }`
- Detail — `{ "data": { ... }, "meta": { "attributions": [...] } }`
- Categories — `{ "data": [{ "key": "heritage", "label": "Heritage" }] }`
- `nextCursor` is a string when more results are available. Empty results return `200` with `data: []` and `nextCursor: null`.
- Include an OpenStreetMap attribution object in place responses with `source`, `text`, `attributionUrl`, `license`, and `licenseUrl`. Use `openstreetmap`, `© OpenStreetMap contributors`, `https://www.openstreetmap.org/copyright`, `ODbL-1.0`, and `https://opendatacommons.org/licenses/odbl/1-0/` respectively.

## Errors and HTTP behavior

Use `{ "error": { "code": "...", "message": "...", "requestId": "..." } }` for API application errors. Return JSON and include `X-Request-Id` on API responses. Keep production error messages safe for public display.

| Status | Code                                                                      |
| ------ | ------------------------------------------------------------------------- |
| `400`  | `INVALID_REQUEST`, `INVALID_ID`, or `INVALID_CURSOR`                      |
| `404`  | `PLACE_NOT_FOUND`                                                         |
| `405`  | `METHOD_NOT_ALLOWED` for unsupported methods on known resources           |
| `429`  | `RATE_LIMITED` with `Retry-After` in seconds                              |
| `503`  | `SERVICE_UNAVAILABLE` for temporary database connection or query failures |
| `500`  | `INTERNAL_ERROR` for unexpected server faults                             |

Coordinate Next.js and proxy behavior so method and rate-limit responses on published routes match the documented contract. Support `HEAD` and `OPTIONS` as HTTP support methods. Configure credential-free CORS for public API routes with `Access-Control-Allow-Origin: *` and expose `X-Request-Id` and `Retry-After`. Test CORS on errors and proxy-generated responses as well as successes. Keep ordinary site pages outside this CORS policy.

## Documentation and compatibility

Keep OpenAPI and the docs synchronized with request validators and response types. Document base URL, limits, errors, CORS, attribution, and the cursor workflow. The detail quickstart should take an ID from a list response. Use clearly labeled example payloads in the docs and consistent response contract tests.

Keep existing response field meanings, category keys, ID encoding, and cursor ordering compatible within v1. Document additive changes. Put breaking changes under a new major URL with a separate docs page and migration guidance.

Reference — [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html)
