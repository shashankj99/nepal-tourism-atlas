import {
  defaultPlaceLimit,
  maxCursorLength,
  maxFilterLength,
  maxPlaceLimit,
  minSearchLength,
  osmAttribution,
  placesExample,
} from "./places";

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/ApiError" } },
  },
});

export const placesOperation = {
  operationId: "listPlaces",
  summary: "List places",
  description: "Returns places in a fixed order. Combine filters and use nextCursor to continue with the same filters.",
  parameters: [
    {
      in: "query",
      name: "q",
      description: "Trimmed, case-insensitive literal substring of the place name.",
      schema: { type: "string", minLength: minSearchLength, maxLength: maxFilterLength },
    },
    {
      in: "query",
      name: "category",
      description: "One key from the category directory.",
      schema: { $ref: "#/components/schemas/Category/properties/key" },
    },
    {
      in: "query",
      name: "locality",
      description: "Trimmed, case-insensitive exact match against the locality.",
      schema: { type: "string", minLength: 1, maxLength: maxFilterLength },
    },
    {
      in: "query",
      name: "limit",
      schema: { type: "integer", minimum: 1, maximum: maxPlaceLimit, default: defaultPlaceLimit },
    },
    {
      in: "query",
      name: "cursor",
      description: "Opaque nextCursor returned by the previous page for the same filters.",
      schema: { type: "string", minLength: 1, maxLength: maxCursorLength },
    },
  ],
  responses: {
    "200": {
      description: "A page of places, which may be empty.",
      headers: { "X-Request-Id": { $ref: "#/components/headers/RequestId" } },
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/PlacesResponse" },
          example: placesExample,
        },
      },
    },
    "400": errorResponse("INVALID_REQUEST or INVALID_CURSOR."),
    "500": errorResponse("INTERNAL_ERROR."),
    "503": errorResponse("SERVICE_UNAVAILABLE."),
  },
};

export const placeSchemas = {
  PlacesResponse: {
    type: "object",
    required: ["data", "meta"],
    properties: {
      data: { type: "array", items: { $ref: "#/components/schemas/Place" } },
      meta: {
        type: "object",
        required: ["limit", "nextCursor", "attributions"],
        properties: {
          limit: { type: "integer", minimum: 1, maximum: maxPlaceLimit },
          nextCursor: { type: ["string", "null"], maxLength: maxCursorLength },
          attributions: {
            type: "array",
            items: { $ref: "#/components/schemas/Attribution" },
          },
        },
      },
    },
  },
  Place: {
    type: "object",
    required: ["id", "name", "category", "locality", "source", "updatedAt"],
    properties: {
      id: { type: "string", description: "Opaque place identifier." },
      name: { type: ["string", "null"] },
      category: { $ref: "#/components/schemas/Category/properties/key" },
      locality: { type: ["string", "null"] },
      source: {
        type: "object",
        required: ["key", "url"],
        properties: {
          key: { const: osmAttribution.source },
          url: { type: ["string", "null"], format: "uri" },
        },
      },
      updatedAt: { type: ["string", "null"], format: "date-time" },
    },
  },
  Attribution: {
    type: "object",
    required: Object.keys(osmAttribution),
    properties: {
      source: { type: "string" },
      text: { type: "string" },
      attributionUrl: { type: "string", format: "uri" },
      license: { type: "string" },
      licenseUrl: { type: "string", format: "uri" },
    },
  },
  ApiError: {
    type: "object",
    required: ["error"],
    properties: {
      error: {
        type: "object",
        required: ["code", "message", "requestId"],
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          requestId: { type: "string", format: "uuid" },
        },
      },
    },
  },
};
