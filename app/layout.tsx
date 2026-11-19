import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nepal Tourism Atlas",
    template: "%s | Nepal Tourism Atlas",
  },
  description: "A free, read-only developer API for Nepal tourism data.",
  icons: { icon: "/atlas-icon.svg" },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection();

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="frame header-inner">
            <Link href="/" className="wordmark">
              <span className="brand-mark" aria-hidden="true" />
              Nepal Tourism Atlas
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/docs/v1">Docs</Link>
              <Link href="/data">Data &amp; licensing</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="frame footer-inner">
            <span>Nepal Tourism Atlas</span>
            <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
