import { readOnlyJson } from "@/lib/api/v1/http";
import { openApi } from "@/lib/api/v1/openapi";

const respond = readOnlyJson(openApi, "public, max-age=300");

export {
  respond as GET,
  respond as HEAD,
  respond as OPTIONS,
  respond as POST,
  respond as PUT,
  respond as PATCH,
  respond as DELETE,
};
