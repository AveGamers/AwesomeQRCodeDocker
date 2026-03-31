import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "kysely";
import { withCors, handlePreflight } from "@/lib/cors";

export async function OPTIONS(request: Request) {
  return handlePreflight(request);
}

/**
 * GET /api/stats/[token]
 * Return scan statistics as JSON for a given stats token.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (process.env.FEATURE_ANALYTICS !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { token } = await params;
  const db = getDb();

  const qr = await db
    .selectFrom("tracked_qrs")
    .selectAll()
    .where("stats_token", "=", token)
    .executeTakeFirst();

  if (!qr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const shortLink = await db
    .selectFrom("short_links")
    .selectAll()
    .where("qr_id", "=", qr.id)
    .executeTakeFirst();

  const shortLinkId = shortLink?.id ?? "";

  const totalScans = await db
    .selectFrom("scan_events")
    .select(db.fn.countAll().as("count"))
    .where("short_link_id", "=", shortLinkId)
    .executeTakeFirst();

  const uniqueVisitors = await db
    .selectFrom("scan_events")
    .select(sql<number>`COUNT(DISTINCT ip_hash)`.as("count"))
    .where("short_link_id", "=", shortLinkId)
    .executeTakeFirst();

  const baseUrl = (
    process.env.SHORT_LINK_DOMAIN ||
    process.env.PUBLIC_BASE_URL ||
    ""
  ).replace(/\/+$/, "");

  return withCors(
    _request,
    NextResponse.json({
      totalScans: Number(totalScans?.count ?? 0),
      uniqueVisitors: Number(uniqueVisitors?.count ?? 0),
      shortLinkUrl: `${baseUrl}/s/${shortLinkId}`,
      qrType: qr.type,
      createdAt: qr.created_at,
    })
  );
}
