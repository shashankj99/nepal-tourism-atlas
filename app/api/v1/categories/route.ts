import { categoriesResponse } from "@/lib/api/v1/categories";
import { readOnlyJson } from "@/lib/api/v1/http";

const respond = readOnlyJson(() => categoriesResponse);

export {
  respond as GET,
  respond as HEAD,
  respond as OPTIONS,
  respond as POST,
  respond as PUT,
  respond as PATCH,
  respond as DELETE,
};
