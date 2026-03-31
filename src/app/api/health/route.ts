import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    features: {
      analytics: process.env.FEATURE_ANALYTICS === "true",
      swagger: process.env.FEATURE_SWAGGER === "true",
      geoip: process.env.FEATURE_GEOIP === "true",
    },
  });
}
