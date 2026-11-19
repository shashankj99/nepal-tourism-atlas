import "server-only";

import { createHash } from "node:crypto";
import { maxCursorLength } from "@/lib/api/v1/places";
import type { CategoryKey } from "@/lib/api/v1/categories";

export type PlaceKey = [sourceId: string, externalId: string];
export type PlaceFilters = {
  q: string | null;
  category: CategoryKey | null;
  locality: string | null;
};

const decoder = new TextDecoder("utf-8", { fatal: true });
const sourceKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const osmKeyPattern = /^(?:node|way|relation)\/[1-9][0-9]{0,19}$/;

function isPlaceKey(key: unknown): key is PlaceKey {
  return Array.isArray(key) && key.length === 2
    && typeof key[0] === "string" && key[0].length <= 64 && sourceKeyPattern.test(key[0])
    && typeof key[1] === "string" && osmKeyPattern.test(key[1]);
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function fingerprint({ q, category, locality }: PlaceFilters): string {
  return createHash("sha256").update(JSON.stringify([q, category, locality])).digest("base64url");
}

export function encodePlaceId(key: PlaceKey): string {
  return encode(key);
}

export function encodeCursor(key: PlaceKey, filters: PlaceFilters): string {
  return encode([1, key, fingerprint(filters)]);
}

export function decodeCursor(token: string, filters: PlaceFilters): PlaceKey | null {
  if (token.length > maxCursorLength || !/^[A-Za-z0-9_-]+$/.test(token)) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(decoder.decode(Buffer.from(token, "base64url")));
    if (!Array.isArray(payload) || payload.length !== 3 || payload[0] !== 1
      || !isPlaceKey(payload[1]) || payload[2] !== fingerprint(filters) || encode(payload) !== token) {
      return null;
    }
    return payload[1];
  } catch {
    return null;
  }
}
