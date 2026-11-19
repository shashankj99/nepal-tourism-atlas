const allowedMethods = "GET, HEAD, OPTIONS";

export function readOnlyJson(data: unknown, cacheControl = "no-store") {
  function respond(request: Request) {
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "X-Request-Id, Retry-After",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": crypto.randomUUID(),
    });

    switch (request.method) {
      case "GET":
      case "HEAD":
        headers.set("Cache-Control", cacheControl);
        if (request.method === "HEAD") {
          headers.set("Content-Type", "application/json");
          return new Response(null, { headers });
        }
        return Response.json(data, { headers });
      case "OPTIONS":
        headers.set("Allow", allowedMethods);
        headers.set("Access-Control-Allow-Methods", allowedMethods);
        return new Response(null, { status: 204, headers });
      default:
        headers.set("Allow", allowedMethods);
        return Response.json(
          {
            error: {
              code: "METHOD_NOT_ALLOWED",
              message: "This resource supports GET, HEAD, and OPTIONS.",
              requestId: headers.get("X-Request-Id"),
            },
          },
          { status: 405, headers },
        );
    }
  }

  return respond;
}
