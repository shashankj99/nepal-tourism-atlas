const allowedMethods = "GET, HEAD, OPTIONS";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function readOnlyJson(
  load: (request: Request) => unknown,
  cacheControl = "no-store",
) {
  async function respond(request: Request) {
    const requestId = crypto.randomUUID();
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "X-Request-Id, Retry-After",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": requestId,
    });

    function errorResponse({ status, code, message }: ApiError) {
      headers.set("Cache-Control", "no-store");
      if (request.method === "HEAD") {
        headers.set("Content-Type", "application/json");
        return new Response(null, { status, headers });
      }
      return Response.json({ error: { code, message, requestId } }, { status, headers });
    }

    switch (request.method) {
      case "GET":
      case "HEAD":
        try {
          const data = await load(request);
          headers.set("Cache-Control", cacheControl);
          if (request.method === "HEAD") {
            headers.set("Content-Type", "application/json");
            return new Response(null, { headers });
          }
          return Response.json(data, { headers });
        } catch (error) {
          if (error instanceof ApiError) {
            if (error.status >= 500) {
              console.error("Atlas API request failed", { requestId, status: error.status, code: error.code });
            }
            return errorResponse(error);
          }
          console.error("Atlas API request failed", { requestId });
          return errorResponse(new ApiError(500, "INTERNAL_ERROR", "An unexpected error occurred."));
        }
      case "OPTIONS":
        headers.set("Allow", allowedMethods);
        headers.set("Access-Control-Allow-Methods", allowedMethods);
        return new Response(null, { status: 204, headers });
      default:
        headers.set("Allow", allowedMethods);
        return errorResponse(new ApiError(405, "METHOD_NOT_ALLOWED", "This resource supports GET, HEAD, and OPTIONS."));
    }
  }

  return respond;
}
