import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recordScan } from "@/lib/analytics/tracker";

/**
 * GET /s/[id]
 * Redirect short link to its target URL and record scan event.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (process.env.FEATURE_ANALYTICS !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = getDb();

  const link = await db
    .selectFrom("short_links")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!link) {
    return NextResponse.json({ error: "Short link not found" }, { status: 404 });
  }

  // Record scan in background (don't slow down the redirect)
  const trackingConfig = {
    clicks: process.env.TRACKING_CLICKS !== "false",
    timestamps: process.env.TRACKING_TIMESTAMPS !== "false",
    browser: process.env.TRACKING_BROWSER !== "false",
    os: process.env.TRACKING_OS !== "false",
    geo: process.env.TRACKING_GEO === "true",
    referrer: process.env.TRACKING_REFERRER !== "false",
    uniqueVisitors: process.env.TRACKING_UNIQUE_VISITORS === "true",
    ipSalt: process.env.TRACKING_IP_SALT || "default-salt",
  };

  // Fire and forget — don't block the redirect
  recordScan(id, request, trackingConfig).catch((err) =>
    console.error("Failed to record scan:", err)
  );

  // Validate target URL before redirect to prevent open redirects
  let targetUrl: string;
  try {
    const parsed = new URL(link.target_url);
    if (!["http:", "https:", "tel:", "mailto:", "sms:", "geo:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }
    targetUrl = parsed.toString();
  } catch {
    // Non-URL content (text, vcard, etc.) — show inline
    return new Response(link.target_url, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.redirect(targetUrl, 302);
}
