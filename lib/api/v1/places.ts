import { apiBaseUrl, type CategoryKey } from "./categories";

export const placesPath = "/api/v1/places";
export const defaultPlaceLimit = 25;
export const maxPlaceLimit = 100;
export const minSearchLength = 3;
export const maxFilterLength = 100;
export const maxCursorLength = 256;

export const placesRequest = `curl '${apiBaseUrl}/places?limit=3'`;
export const localPlacesRequest = `curl 'http://localhost:3000${placesPath}?limit=3'`;

export const osmAttribution = {
  source: "openstreetmap",
  text: "© OpenStreetMap contributors",
  attributionUrl: "https://www.openstreetmap.org/copyright",
  license: "ODbL-1.0",
  licenseUrl: "https://opendatacommons.org/licenses/odbl/1-0/",
} as const;

export type Place = {
  id: string;
  name: string | null;
  category: CategoryKey;
  locality: string | null;
  source: { key: typeof osmAttribution.source; url: string | null };
  updatedAt: string | null;
};

export type PlacesResponse = {
  data: Place[];
  meta: {
    limit: number;
    nextCursor: string | null;
    attributions: (typeof osmAttribution)[];
  };
};

export const placesExample: PlacesResponse = {
  data: [{
    id: "WyJvc20tbmVwYWwiLCJub2RlLzEiXQ",
    name: "Example viewpoint",
    category: "destination",
    locality: "Pokhara",
    source: { key: osmAttribution.source, url: null },
    updatedAt: "2026-11-18T07:15:00.000Z",
  }],
  meta: { limit: defaultPlaceLimit, nextCursor: null, attributions: [osmAttribution] },
};
