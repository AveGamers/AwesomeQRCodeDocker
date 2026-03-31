import { NextResponse } from "next/server";
import { withCors, handlePreflight } from "@/lib/cors";

export async function OPTIONS(request: Request) {
  return handlePreflight(request);
}

export async function GET(request: Request) {
  return withCors(
    request,
    NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      features: {
        analytics: process.env.FEATURE_ANALYTICS === "true",
        swagger: process.env.FEATURE_SWAGGER === "true",
        geoip: process.env.FEATURE_GEOIP === "true",
      },
    })
  );
}
