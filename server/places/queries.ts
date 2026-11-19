import "server-only";

import { ApiError } from "@/lib/api/v1/http";
import { osmAttribution, type Place, type PlacesResponse } from "@/lib/api/v1/places";
import { DatabaseUnavailable, query } from "@/server/db/pool";
import { encodeCursor, encodePlaceId } from "./pagination";
import type { ListPlacesParams } from "./params";

type PlaceRow = {
  source_id: string;
  external_id: string;
  name: string | null;
  category: Place["category"];
  locality: string | null;
  source_url: string | null;
  updated_at: Date | null;
};

function serializePlace(row: PlaceRow): Place {
  const expectedUrl = `https://www.openstreetmap.org/${row.external_id}`;

  return {
    id: encodePlaceId([row.source_id, row.external_id]),
    name: row.name?.trim() ? row.name : null,
    category: row.category,
    locality: row.locality?.trim() ? row.locality : null,
    source: { key: osmAttribution.source, url: row.source_url === expectedUrl ? expectedUrl : null },
    updatedAt: row.updated_at?.toISOString() ?? null,
  };
}

export async function listPlaces(params: ListPlacesParams): Promise<PlacesResponse> {
  const values: (string | number)[] = [];
  const predicates: string[] = [];
  const bind = (value: string | number) => `$${values.push(value)}`;

  if (params.q !== null) {
    const literal = params.q.replace(/[!%_]/g, "!$&");
    predicates.push(`name ILIKE ${bind(`%${literal}%`)} ESCAPE '!'`);
  }
  if (params.category !== null) predicates.push(`category = ${bind(params.category)}`);
  if (params.locality !== null) predicates.push(`lower(locality) = lower(${bind(params.locality)})`);
  if (params.after) {
    const [sourceId, externalId] = params.after;
    predicates.push(`(source_id, external_id) > (${bind(sourceId)}, ${bind(externalId)})`);
  }

  const where = predicates.length ? `WHERE ${predicates.join(" AND ")}` : "";
  let rows: PlaceRow[];
  try {
    rows = await query<PlaceRow>(
      `SELECT source_id, external_id, name, category, locality, source_url, updated_at
       FROM atlas_public.places_v1
       ${where}
       ORDER BY source_id ASC, external_id ASC
       LIMIT ${bind(params.limit + 1)}`,
      values,
    );
  } catch (error) {
    if (error instanceof DatabaseUnavailable) {
      throw new ApiError(503, "SERVICE_UNAVAILABLE", "Place data is temporarily unavailable.");
    }
    throw error;
  }

  const page = rows.slice(0, params.limit);
  const last = page.at(-1);
  return {
    data: page.map(serializePlace),
    meta: {
      limit: params.limit,
      nextCursor: last && rows.length > params.limit
        ? encodeCursor([last.source_id, last.external_id], params)
        : null,
      attributions: [osmAttribution],
    },
  };
}
