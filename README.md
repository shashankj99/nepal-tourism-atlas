# Nepal Tourism Atlas

A free, read-only Next.js API for Nepal tourism data. The first feature publishes
the v1 category directory and documents how to use it.

## Run locally

```sh
npm ci
npm run dev
```

Open [the landing page](http://localhost:3000), [developer docs](http://localhost:3000/docs/v1),
or [data and licensing](http://localhost:3000/data).

```sh
curl 'http://localhost:3000/api/v1/categories'
curl 'http://localhost:3000/api/v1/openapi.json'
```

The category directory uses the vocabulary in the v1 contract independently of
PostgreSQL. Live place listings and record lookups require a reviewed source
allowlist, category mapping, and restricted runtime access to the public view.
See [data preflight](.agents/DATA_AND_LICENSING.md#preflight).

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
