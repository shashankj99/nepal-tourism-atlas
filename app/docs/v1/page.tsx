import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import {
  apiBaseUrl,
  categoriesPath,
  categoriesRequest,
  categoriesResponse,
  localCategoriesRequest,
  openApiPath,
} from "@/lib/api/v1/categories";

export const metadata: Metadata = { title: "API v1 documentation" };

const responseExample = JSON.stringify(categoriesResponse, null, 2);

export default function DocsPage() {
  return (
    <main id="main" className="frame docs">
      <nav className="docs-nav" aria-label="On this page">
        <a href="#quickstart">Quickstart</a>
        <a href="#categories">Categories</a>
        <a href="#http">HTTP behavior</a>
        <a href={openApiPath}>OpenAPI JSON</a>
      </nav>
      <article className="article">
        <header>
          <p className="eyebrow">Developer documentation</p>
          <h1>API v1</h1>
          <p className="lede">Find the category keys used to organize tourism data in the Atlas.</p>
          <p>Production base URL <code className="inline-code">{apiBaseUrl}</code></p>
        </header>

        <section id="quickstart">
          <h2>Quickstart</h2>
          <p>Run the request below or <a href={categoriesPath}>open the response in your browser</a>. The API is free and requires no account or API key.</p>
          <CodeBlock label="cURL request" code={categoriesRequest} />
          <p>For a local server on the default port, run this request.</p>
          <CodeBlock label="Local cURL request" code={localCategoriesRequest} />
        </section>
        <section id="categories">
          <h2>List categories</h2>
          <p className="endpoint"><span className="method">GET</span> <code>/categories</code></p>
          <p>The response contains a <code>data</code> array. Each item has a stable string <code>key</code> and a human-readable <code>label</code>. Category vocabulary describes how records can be grouped. Record availability depends on the published dataset.</p>
          <CodeBlock label="Example JSON response" code={responseExample} />
        </section>
        <section id="http">
          <h2>HTTP behavior</h2>
          <dl className="http-details">
            <dt>Methods</dt>
            <dd><code>GET</code> returns JSON, <code>HEAD</code> returns headers only, and <code>OPTIONS</code> returns <code>204</code> with the allowed methods.</dd>
            <dt>Browser access</dt>
            <dd>Use cross-origin requests without credentials. Responses expose <code>X-Request-Id</code> and <code>Retry-After</code> to browser callers.</dd>
            <dt>Errors</dt>
            <dd><code>POST</code>, <code>PUT</code>, <code>PATCH</code>, and <code>DELETE</code> return <code>405 METHOD_NOT_ALLOWED</code>. The JSON error includes <code>code</code>, <code>message</code>, and <code>requestId</code> in an <code>error</code> object.</dd>
          </dl>
          <p>See <Link href="/data">data and licensing</Link> for attribution and reuse terms.</p>
        </section>
      </article>
    </main>
  );
}
