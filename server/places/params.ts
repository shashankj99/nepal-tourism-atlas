import "server-only";

import { ApiError } from "@/lib/api/v1/http";
import { categories } from "@/lib/api/v1/categories";
import { defaultPlaceLimit, maxFilterLength, maxPlaceLimit, minSearchLength } from "@/lib/api/v1/places";
import { decodeCursor, type PlaceFilters, type PlaceKey } from "./pagination";

const parameterNames = new Set(["q", "category", "locality", "limit", "cursor"]);
// Two 100-code-point filters fit even when all UTF-8 bytes are percent encoded.
const maxQueryLength = 4_096;

export type ListPlacesParams = PlaceFilters & { limit: number; after: PlaceKey | null };

function textFilter(value: string | undefined, name: string, minimum: number): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  const length = [...trimmed].length;
  if (length < minimum || length > maxFilterLength || trimmed.includes("\0")) {
    throw new ApiError(400, "INVALID_REQUEST", `${name} must contain ${minimum}–${maxFilterLength} Unicode code points.`);
  }
  return trimmed;
}

export function listPlacesParams(url: URL): ListPlacesParams {
  if (url.search.length > maxQueryLength) {
    throw new ApiError(400, "INVALID_REQUEST", "The query string is too long.");
  }
  try {
    decodeURIComponent(url.search);
  } catch {
    throw new ApiError(400, "INVALID_REQUEST", "The query string must use valid percent-encoded UTF-8.");
  }

  const values = new Map<string, string>();
  for (const [name, value] of url.searchParams) {
    if (!parameterNames.has(name) || values.has(name)) {
      throw new ApiError(400, "INVALID_REQUEST", "Use each supported query parameter at most once.");
    }
    values.set(name, value);
  }

  const rawLimit = values.get("limit");
  const limit = rawLimit === undefined ? defaultPlaceLimit : Number(rawLimit);
  if (rawLimit !== undefined && (!/^[0-9]+$/.test(rawLimit) || limit < 1 || limit > maxPlaceLimit)) {
    throw new ApiError(400, "INVALID_REQUEST", `limit must be an integer from 1 to ${maxPlaceLimit}.`);
  }

  const rawCategory = values.get("category");
  const category = categories.find(({ key }) => key === rawCategory)?.key ?? null;
  if (rawCategory !== undefined && category === null) {
    throw new ApiError(400, "INVALID_REQUEST", "category must be a supported v1 key.");
  }

  const filters: PlaceFilters = {
    q: textFilter(values.get("q"), "q", minSearchLength),
    category,
    locality: textFilter(values.get("locality"), "locality", 1),
  };
  const token = values.get("cursor");
  const after = token === undefined ? null : decodeCursor(token, filters);
  if (token !== undefined && !after) {
    throw new ApiError(400, "INVALID_CURSOR", "Use the cursor returned for the same filters.");
  }

  return { ...filters, limit, after };
}
