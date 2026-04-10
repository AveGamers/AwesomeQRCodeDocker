import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ensureDbReady } from "@/lib/db";
import { withCors, handlePreflight } from "@/lib/cors";

export async function OPTIONS(request: Request) {
  return handlePreflight(request);
}

function getLocaleSegment(request: Request) {
  const availableLocales = (process.env.AVAILABLE_LOCALES || "en,de")
    .split(",")
    .map((locale) => locale.trim())
    .filter(Boolean);
  const referer = request.headers.get("referer");
  let localeSegment = process.env.DEFAULT_LOCALE || "en";

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const maybeLocale = refererUrl.pathname.split("/").filter(Boolean)[0];

      if (availableLocales.includes(maybeLocale)) {
        localeSegment = maybeLocale;
      }
    } catch {
      // Ignore invalid referrer values.
    }
  }

  return localeSegment;
}

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
    const { type, content, styleOptions, activate = false } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: "Missing 'type' or 'content'" },
        { status: 400 }
      );
    }

    const db = await ensureDbReady();
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
        is_active: Boolean(activate),
      })
      .execute();

    const publicBase = (
      process.env.PUBLIC_BASE_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");
    const localeSegment = getLocaleSegment(request);

    return withCors(
      request,
      NextResponse.json({
        qrId,
        shortId,
        shortLinkUrl: `${baseUrl}/s/${shortId}`,
        statsToken,
        statsUrl: `${publicBase}/${localeSegment}/stats/${statsToken}`,
        isActive: Boolean(activate),
      })
    );
  } catch (err) {
    console.error("shortlink creation error:", err);
    return NextResponse.json(
      { error: "Failed to create short link" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (process.env.FEATURE_ANALYTICS !== "true") {
    return NextResponse.json(
      { error: "Analytics feature is disabled" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      qrId,
      shortId,
      type,
      content,
      styleOptions,
      activate = false,
    } = body;

    if (!qrId || !shortId || !type || !content) {
      return NextResponse.json(
        { error: "Missing 'qrId', 'shortId', 'type' or 'content'" },
        { status: 400 }
      );
    }

    const db = await ensureDbReady();
    const baseUrl = (
      process.env.SHORT_LINK_DOMAIN ||
      process.env.PUBLIC_BASE_URL ||
      "http://localhost:3000"
    ).replace(/\/+$/, "");

    const qr = await db
      .selectFrom("tracked_qrs")
      .selectAll()
      .where("id", "=", qrId)
      .executeTakeFirst();

    if (!qr) {
      return NextResponse.json({ error: "Tracked QR not found" }, { status: 404 });
    }

    await db
      .updateTable("tracked_qrs")
      .set({
        type,
        content,
        style_options: styleOptions ? JSON.stringify(styleOptions) : null,
        canonical_base_url: baseUrl,
      })
      .where("id", "=", qrId)
      .execute();

    await db
      .updateTable("short_links")
      .set({
        target_url: content,
        canonical_base_url: baseUrl,
        is_active: Boolean(activate),
      })
      .where("id", "=", shortId)
      .execute();

    const publicBase = (
      process.env.PUBLIC_BASE_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");
    const localeSegment = getLocaleSegment(request);

    return withCors(
      request,
      NextResponse.json({
        qrId,
        shortId,
        shortLinkUrl: `${baseUrl}/s/${shortId}`,
        statsToken: qr.stats_token,
        statsUrl: `${publicBase}/${localeSegment}/stats/${qr.stats_token}`,
        isActive: Boolean(activate),
      })
    );
  } catch (err) {
    console.error("shortlink update error:", err);
    return NextResponse.json(
      { error: "Failed to update short link" },
      { status: 500 }
    );
  }
}
