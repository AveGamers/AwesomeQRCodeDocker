import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";

/**
 * POST /api/shortlink
 * Create a tracked QR code + short link.
 * Body: { type, content, styleOptions? }
 */
export async function POST(request: Request) {
  if (process.env.FEATURE_ANALYTICS !== "true") {
    return NextResponse.json(
      { error: "Analytics feature is disabled" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { type, content, styleOptions } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: "Missing 'type' or 'content'" },
        { status: 400 }
      );
    }

    const db = getDb();
    const qrId = nanoid(21);
    const statsToken = nanoid(32);
    const shortId = nanoid(8);
    const baseUrl = (
      process.env.SHORT_LINK_DOMAIN ||
      process.env.PUBLIC_BASE_URL ||
      "http://localhost:3000"
    ).replace(/\/+$/, "");

    // Insert tracked QR
    await db
      .insertInto("tracked_qrs")
      .values({
        id: qrId,
        type,
        content,
        style_options: styleOptions ? JSON.stringify(styleOptions) : null,
        canonical_base_url: baseUrl,
        stats_token: statsToken,
      })
      .execute();

    // Insert short link
    await db
      .insertInto("short_links")
      .values({
        id: shortId,
        qr_id: qrId,
        target_url: content,
        canonical_base_url: baseUrl,
      })
      .execute();

    const publicBase = (
      process.env.PUBLIC_BASE_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");

    return NextResponse.json({
      qrId,
      shortId,
      shortLinkUrl: `${baseUrl}/s/${shortId}`,
      statsToken,
      statsUrl: `${publicBase}/stats/${statsToken}`,
    });
  } catch (err) {
    console.error("shortlink creation error:", err);
    return NextResponse.json(
      { error: "Failed to create short link" },
      { status: 500 }
    );
  }
}
