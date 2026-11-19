import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { categories, categoriesPath } from "@/lib/api/v1/categories";
import { localPlacesRequest, placesPath, placesRequest } from "@/lib/api/v1/places";

const quickstartRequest = process.env.NODE_ENV === "development"
  ? localPlacesRequest
  : placesRequest;

export default function Home() {
  return (
    <main id="main">
      <section className="frame hero" aria-labelledby="home-title">
        <div>
          <p className="eyebrow">Open data for developers</p>
          <h1 id="home-title">Nepal tourism data for your next project.</h1>
          <p className="lede">
            Find destinations, stays, restaurants, heritage sites, and more in
            a free API powered by OpenStreetMap data.
          </p>
          <div className="actions">
            <Link className="button button-primary" href="/docs/v1">Read the docs</Link>
            <a className="button button-secondary" href={`${placesPath}?limit=3`}>View API response</a>
          </div>
        </div>
        <div className="directory">
          <div className="directory-header">
            <span className="method">GET</span>
            <code>{categoriesPath}</code>
          </div>
          <dl>
            {categories.map(({ key, label }) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd><code>{key}</code></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="quickstart" aria-labelledby="quickstart-title">
        <div className="frame quickstart-inner">
          <div>
            <h2 id="quickstart-title">Make your first request</h2>
            <p>Fetch three places with a single request. No API key required.</p>
          </div>
          <CodeBlock label="cURL request" code={quickstartRequest} />
        </div>
      </section>
      <section className="frame source-section" aria-labelledby="source-title">
        <h2 id="source-title">Built on OpenStreetMap</h2>
        <p>Read about the source, coverage, and terms for reusing the data.</p>
        <Link href="/data">Data &amp; licensing</Link>
      </section>
    </main>
  );
}
