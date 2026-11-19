# Nepal Tourism Atlas — Design System

## Design intent

Pair the visual character of a contemporary atlas with the readability of developer documentation. Use photography to establish the place, concise copy to explain the product, and a real API request to show how it works.

Validate three first-visit tasks during review. Can someone identify what the API offers, locate the quickstart, and find the data source and reuse terms? Run the walkthrough at phone and desktop widths. Treat these tasks as design hypotheses until tested with users.

## Landing page

1. **Header.** Use the Nepal Tourism Atlas wordmark and links to Docs and Data & licensing. Keep the docs link easy to reach on mobile.
2. **Hero.** Use a split layout on wide screens and stack the text above the image on mobile. Suggested heading — “Nepal tourism data for your next project.” Follow with one sentence about the free API and the kinds of places it covers. Primary action — “Read the docs.” Secondary action — “View API response,” linked to the working list endpoint.
3. **Quickstart.** Show a copyable cURL request and a compact JSON example. Give the code block enough breathing room to make the request legible. Use a fixture from the implementation and label it as an example. Show a confirmation after copying. Keep the request visible as selectable text if clipboard access fails.
4. **Dataset coverage.** Group categories in a compact grid with plain-language labels. Use verified coverage claims. A single strong visual or small set of credited photographs is enough.
5. **Data and licensing.** Explain that the dataset comes from OpenStreetMap and link to `/data` for attribution, limitations, and applicable download information.

Suggested quickstart request:

```bash
curl 'https://atlas.cloveit.com.np/api/v1/places?limit=3'
```

## Visual language

| Role          | Starting token | Use                                             |
| ------------- | -------------- | ----------------------------------------------- |
| Crimson       | `#B51234`      | Primary actions and small accents               |
| Crimson hover | `#920D2A`      | Primary action hover                            |
| Deep blue     | `#12347D`      | Links, focus indicators, and navigation accents |
| Ink           | `#151D2F`      | Headings and body text                          |
| Muted ink     | `#4C5870`      | Secondary copy                                  |
| Paper         | `#F8F8F5`      | Page background                                 |
| White         | `#FFFFFF`      | Raised surfaces and button text on crimson      |
| Code surface  | `#111A30`      | Code blocks with light text                     |

Define role-based CSS variables and verify every text, control, and focus pairing in its actual state. Use a distinct focus ring on dark and light surfaces. Let crimson and blue carry the identity through small, deliberate accents.

Use Instrument Sans or an existing readable sans-serif for UI, IBM Plex Mono or a system monospace for code, and a verified Devanagari fallback such as Noto Sans Devanagari when Nepali text appears. Test the fallback before adding Nepali labels. Use a comfortable body size near 16–18 px, a reading width around 65 characters, and fluid headings that fit narrow screens. Keep code overflow inside its own container.

## Art direction

- Use one strong, authentic Nepal photograph with a readable crop at desktop and phone widths. Show breadth through the supporting imagery where appropriate, including heritage, everyday places, and hills or the Terai alongside Himalayan scenery.
- Use photography the project owns or has permission to publish. Record source, creator, license, and required credit. Scraped image URLs and OSM record URLs do not establish image rights.
- Use neutral captions unless the location is verified. Label generated imagery as illustration where it could be mistaken for a real location. Use licensed reference photography for an identifiable place.
- Serve sized, responsive assets via `next/image`. Reserve their dimensions to prevent layout shift. Load the hero eagerly only when it is the page's primary above-the-fold image. Keep text available independently of the image.

## Motion and interaction

Use CSS for brief hover, focus, and copy feedback, generally 150–250 ms. If using an entry transition, keep content visible and usable before JavaScript loads. Honor `prefers-reduced-motion` and preserve immediate state feedback. Skip autoplay, parallax, scroll hijacking, and looping decorative motion.

Target WCAG 2.2 AA. Include a skip link, semantic landmarks, visible keyboard focus, descriptive links, and alt text for meaningful images. Test at 320 px width, at 200% zoom, with keyboard-only navigation, and with reduced motion. Check the docs navigation and code overflow on a real phone or mobile browser.

## Developer docs

Use a persistent table of contents on large screens and a compact version on mobile. Put the base URL and first request near the top. Keep schema tables, cURL examples, and response examples readable on phones. Use the same typography and tokens as the landing page, with higher information density and minimal imagery.

References — [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image)
