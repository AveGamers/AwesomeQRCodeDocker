import { NextResponse } from "next/server";

interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string;
  allowedHeaders: string;
  maxAge: number;
}

function getCorsConfig(): CorsConfig {
  const raw = process.env.CORS_ALLOWED_ORIGINS || "";
  return {
    allowedOrigins: raw
      ? raw.split(",").map((o) => o.trim())
      : [],
    allowedMethods: process.env.CORS_ALLOWED_METHODS || "GET,POST,OPTIONS",
    allowedHeaders:
      process.env.CORS_ALLOWED_HEADERS || "Content-Type,Authorization",
    maxAge: Number(process.env.CORS_MAX_AGE) || 86400,
  };
}

function isOriginAllowed(origin: string | null, config: CorsConfig): boolean {
  if (!origin) return false;
  if (config.allowedOrigins.length === 0) return false;
  if (config.allowedOrigins.includes("*")) return true;
  return config.allowedOrigins.includes(origin);
}

/**
 * Add CORS headers to a response based on the request origin.
 * Returns the response unchanged if CORS_ALLOWED_ORIGINS is empty (same-origin only).
 */
export function withCors(request: Request, response: NextResponse): NextResponse {
  const config = getCorsConfig();
  const origin = request.headers.get("origin");

  if (!isOriginAllowed(origin, config)) return response;

  response.headers.set("Access-Control-Allow-Origin", origin!);
  response.headers.set("Access-Control-Allow-Methods", config.allowedMethods);
  response.headers.set("Access-Control-Allow-Headers", config.allowedHeaders);
  response.headers.set("Access-Control-Max-Age", String(config.maxAge));
  response.headers.set("Vary", "Origin");

  return response;
}

/**
 * Handle CORS preflight (OPTIONS) request.
 * Returns a 204 with CORS headers if the origin is allowed, 403 otherwise.
 */
export function handlePreflight(request: Request): NextResponse {
  const config = getCorsConfig();
  const origin = request.headers.get("origin");

  if (!isOriginAllowed(origin, config)) {
    return NextResponse.json(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin!,
      "Access-Control-Allow-Methods": config.allowedMethods,
      "Access-Control-Allow-Headers": config.allowedHeaders,
      "Access-Control-Max-Age": String(config.maxAge),
      Vary: "Origin",
    },
  });
}
