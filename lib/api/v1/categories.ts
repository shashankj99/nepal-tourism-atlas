export const categoriesPath = "/api/v1/categories";
export const openApiPath = "/api/v1/openapi.json";
export const apiBaseUrl = "https://atlas.cloveit.com.np/api/v1";

export const categories = [
  { key: "destination", label: "Destination" },
  { key: "accommodation", label: "Accommodation" },
  { key: "food", label: "Food" },
  { key: "heritage", label: "Heritage" },
  { key: "park", label: "Park" },
  { key: "transport", label: "Transport" },
  { key: "trail", label: "Trail" },
] as const;

export const categoriesResponse = { data: categories };
export const categoriesRequest = `curl '${apiBaseUrl}/categories'`;
export const localCategoriesRequest = `curl 'http://localhost:3000${categoriesPath}'`;

export type CategoryKey = (typeof categories)[number]["key"];
