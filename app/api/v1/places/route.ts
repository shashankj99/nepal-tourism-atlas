import { readOnlyJson } from "@/lib/api/v1/http";
import { listPlacesParams } from "@/server/places/params";
import { listPlaces } from "@/server/places/queries";

export const runtime = "nodejs";

const respond = readOnlyJson((request) => listPlaces(listPlacesParams(new URL(request.url))));

export {
  respond as GET,
  respond as HEAD,
  respond as OPTIONS,
  respond as POST,
  respond as PUT,
  respond as PATCH,
  respond as DELETE,
};
