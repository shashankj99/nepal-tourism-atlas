# Nepal Tourism Atlas — Data and Licensing

## Existing database

The owner reports that PostgreSQL database `scrapy-nepal` already exists in Docker and the `scrapy_nepal` CLI migrations have been applied.

| Table               | Supplied structure                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ingest.sources`    | Source IDs and reuse terms                                                                                                                                                              |
| `ingest.crawl_runs` | Import status, timestamps, record counts, and error codes                                                                                                                               |
| `ingest.places`     | `source_id`, `external_id`, `name`, `category`, `locality`, `source_url`, `last_seen_at`, `updated_at`, and optional `details` JSONB. Composite primary key `(source_id, external_id)`. |

The owner verified 68,542 OpenStreetMap records in the import. Actual column types, nullability, source IDs, category values, field quality, and current public counts require inspection.

## Preflight

1. Inspect importer migrations and read-only catalog metadata. Confirm actual key types, timestamp types and time zone semantics, foreign keys, indexes, and server version. Keep credentials redacted. If the database is unavailable, build the static pages and contract code against labeled fixtures and record which database assumptions still need verification.
2. Audit the source registry and a sample of places. Confirm the source IDs backed by approved OpenStreetMap data. Count raw categories, missing names and localities, and unexpected source URLs. Review `details` key names if relevant to the audit. Keep raw JSONB out of the public API.
3. Map observed categories to the public vocabulary. Record exclusions and counts for unmapped categories. Use the same mapping and filters for list results, detail results, and any public count.
4. Return absent or blank optional text as `null`. Preserve original names such as Devanagari text. Validate source URLs against an approved OpenStreetMap host list and return `null` for invalid or unverified links. Publish `updatedAt` only when its source timezone and meaning have been established.
5. Publish the approved view with a restricted runtime role. Exclude demo fixtures, crawl runs, error metadata, unreviewed sources, and raw import metadata from public responses and exports.

## Attribution and redistribution

OpenStreetMap data is available under the Open Database License v1.0. Show “© OpenStreetMap contributors” with a link to the OpenStreetMap copyright page and an ODbL link. Include the source and licensing information on `/data`, in the developer docs, in place response metadata, and in any dataset export. If a map is added later, place attribution where map users can find it and check the tile provider's terms separately.

Before public launch, review how the crawler sourced the data and what transformations the Atlas release applies. Determine whether the public dataset qualifies as a Derivative Database under the ODbL. Where §4.6 applies, offer the corresponding derivative database or a qualifying machine-readable set of alterations free of charge online. A versioned compressed CSV or NDJSON of the complete relevant derivative dataset is a practical route when it satisfies that obligation. Preserve attribution and the ODbL notice with the export. Document the release date and what the download contains. Review API usage terms and limits alongside any required download so they preserve rights granted by the license.

Assess any new source individually for storage and republication rights before making it public. Keep source provenance available and review license compatibility before combining sources. Maintain separate licensing records for the application code, photographs, editorial content, and data.

References — [OpenStreetMap copyright and license](https://www.openstreetmap.org/copyright) · [OSMF attribution guidelines](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines) · [ODbL v1.0](https://opendatacommons.org/licenses/odbl/1-0/)
