import { apiBaseUrl, categories, categoriesResponse } from "./categories";

import { placeSchemas, placesOperation } from "./places-openapi";

const requestIdHeader = {
  "X-Request-Id": { $ref: "#/components/headers/RequestId" },
};

export const openApi = {
  openapi: "3.1.1",
  info: {
    title: "Nepal Tourism Atlas API",
    version: "1",
    description: "A free, read-only API for Nepal tourism data. Browse published places and discover the v1 category vocabulary.",
  },
  servers: [{ url: apiBaseUrl }],
  externalDocs: { description: "Developer documentation", url: "https://atlas.cloveit.com.np/docs/v1" },
  paths: {
    "/places": { get: placesOperation },
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
    headers: {
      RequestId: { description: "Request identifier.", schema: { type: "string", format: "uuid" } },
    },
    schemas: {
      ...placeSchemas,
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
