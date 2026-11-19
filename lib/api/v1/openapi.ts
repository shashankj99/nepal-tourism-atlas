import { apiBaseUrl, categories, categoriesResponse } from "./categories";

const requestIdHeader = {
  "X-Request-Id": { description: "Unique response identifier.", schema: { type: "string", format: "uuid" } },
};

export const openApi = {
  openapi: "3.1.1",
  info: {
    title: "Nepal Tourism Atlas API",
    version: "1",
    description: "A free, read-only API for Nepal tourism data. This release exposes the v1 category vocabulary.",
  },
  servers: [{ url: apiBaseUrl }],
  externalDocs: { description: "Developer documentation", url: "https://atlas.cloveit.com.np/docs/v1" },
  paths: {
    "/categories": {
      get: {
        operationId: "listCategories",
        summary: "List categories",
        description: "Returns category keys and their display labels. The vocabulary is independent of record availability.",
        responses: {
          "200": {
            description: "Category vocabulary",
            headers: requestIdHeader,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoriesResponse" },
                example: categoriesResponse,
              },
            },
          },
        },
      },
    },
    "/openapi.json": {
      get: {
        operationId: "getOpenApi",
        summary: "Get the v1 OpenAPI document",
        responses: {
          "200": {
            description: "OpenAPI 3.1 document",
            headers: requestIdHeader,
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CategoriesResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Category" } },
        },
      },
      Category: {
        type: "object",
        required: ["key", "label"],
        properties: {
          key: { type: "string", enum: categories.map(({ key }) => key) },
          label: { type: "string", description: "Human-readable display label." },
        },
      },
    },
  },
};
