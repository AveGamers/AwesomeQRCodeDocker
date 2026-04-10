import { NextResponse } from "next/server";
import { withCors, handlePreflight } from "@/lib/cors";
import { getPublicConfig } from "@/lib/env";

export async function OPTIONS(request: Request) {
  return handlePreflight(request);
}

export async function GET(request: Request) {
  const response = NextResponse.json(getPublicConfig(), {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });

  return withCors(request, response);
}