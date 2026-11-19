import { CodeBlock } from "@/components/code-block";
import {
  defaultPlaceLimit,
  localPlacesRequest,
  maxFilterLength,
  maxPlaceLimit,
  minSearchLength,
  placesExample,
  placesPath,
  placesRequest,
} from "@/lib/api/v1/places";

export function PlacesSection() {
  return (
    <section id="places">
      <h2>List places</h2>
      <p className="endpoint"><span className="method">GET</span> <code>/places</code></p>
      <p><a href={`${placesPath}?limit=3`}>Open the first three places</a> or run the cURL request.</p>
      <CodeBlock label="Places cURL request" code={placesRequest} />
      <CodeBlock label="Local places cURL request" code={localPlacesRequest} />
      <dl className="http-details">
        <dt><code>q</code></dt>
        <dd>A literal substring of the name, {minSearchLength}–{maxFilterLength} Unicode code points after trimming.</dd>
        <dt><code>category</code></dt>
        <dd>One key from the <a href="#categories">category directory</a>.</dd>
        <dt><code>locality</code></dt>
        <dd>An exact locality match, 1–{maxFilterLength} Unicode code points after trimming.</dd>
        <dt><code>limit</code></dt>
        <dd>A decimal integer from 1 to {maxPlaceLimit}. The default is {defaultPlaceLimit}.</dd>
        <dt><code>cursor</code></dt>
        <dd>The opaque <code>meta.nextCursor</code> value from the previous page.</dd>
      </dl>
      <p>
        Filters combine with AND. Name and locality matching follow the database&apos;s
        case rules. Percent signs and underscores in <code>q</code> match literally.
        Use URL encoding when sending punctuation or non-ASCII characters.
        Results use a fixed order and support literal name matching only.
      </p>
      <h3>Continue to the next page</h3>
      <p>
        Read the places from <code>data</code>. If <code>meta.nextCursor</code> is a string,
        send it as <code>cursor</code> on the next request with the same filters. You may change
        the page size. Stop when the cursor is <code>null</code>. New imports can change records
        between requests.
      </p>
      <p>
        Place IDs are opaque. Names, localities, source URLs, and update timestamps may be{" "}
        <code>null</code>. <code>updatedAt</code> describes changes to the imported record in UTC.
        Use <code>meta.attributions</code> when reusing the data.
      </p>
      <CodeBlock label="Illustrative places response" code={JSON.stringify(placesExample, null, 2)} />
      <p>
        Invalid filters or duplicate parameters return <code>400 INVALID_REQUEST</code>.
        Malformed or mismatched cursors return <code>400 INVALID_CURSOR</code>.
        If the serving database is unavailable, the endpoint returns <code>503 SERVICE_UNAVAILABLE</code>.
      </p>
    </section>
  );
}
