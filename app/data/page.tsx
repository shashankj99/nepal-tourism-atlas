import type { Metadata } from "next";

export const metadata: Metadata = { title: "Data and licensing" };

export default function DataPage() {
  return (
    <main id="main" className="frame">
      <article className="article data-page">
        <p className="eyebrow">Data provenance</p>
        <h1>Data &amp; licensing</h1>
        <p className="lede">The Atlas uses tourism-related data collected from OpenStreetMap.</p>

        <section>
          <h2>Source and coverage</h2>
          <p>
            OpenStreetMap coverage depends on what contributors have mapped and what
            the importer has collected. The v1 API uses records from the Geofabrik Nepal
            snapshot and approved regional OpenStreetMap imports. Localities can describe
            an import area. Trail records describe mapped trails and omit route geometry.
          </p>
        </section>
        <section>
          <h2>Attribution and reuse</h2>
          <p>
            OpenStreetMap data is available under the <a href="https://opendatacommons.org/licenses/odbl/1-0/">Open Database License 1.0</a>.
            Credit <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a> when using OpenStreetMap data
            and follow the <a href="https://osmfoundation.org/wiki/Licence/Attribution_Guidelines">OpenStreetMap attribution guidelines</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
