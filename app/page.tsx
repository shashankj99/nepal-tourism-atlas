import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import {
  categories,
  categoriesPath,
  categoriesRequest,
  localCategoriesRequest,
} from "@/lib/api/v1/categories";

const quickstartRequest = process.env.NODE_ENV === "development"
  ? localCategoriesRequest
  : categoriesRequest;

export default function Home() {
  return (
    <main id="main">
      <section className="frame hero" aria-labelledby="home-title">
        <div>
          <p className="eyebrow">Open data for developers</p>
          <h1 id="home-title">Nepal tourism data for your next project.</h1>
          <p className="lede">
            Explore how the Atlas groups tourism data from OpenStreetMap.
            The free v1 API starts with a directory of category keys.
          </p>
          <div className="actions">
            <Link className="button button-primary" href="/docs/v1">Read the docs</Link>
            <a className="button button-secondary" href={categoriesPath}>View API response</a>
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
            <p>Fetch the full category directory with a single request. No API key required.</p>
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
