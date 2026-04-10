import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { recordScan } from "@/lib/analytics/tracker";

/**
 * GET /s/[id]
 * Redirect short link to its target URL and record scan event.
 *
 * When FEATURE_EXTENDED_PRIVACY=true, shows an interstitial page
 * where the visitor can choose between full tracking or click-only.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (process.env.FEATURE_ANALYTICS !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = await ensureDbReady();

  const link = await db
    .selectFrom("short_links")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!link) {
    return NextResponse.json({ error: "Short link not found" }, { status: 404 });
  }

  // Validate target URL before redirect to prevent open redirects
  let targetUrl: string;
  let isRedirectable = true;
  try {
    const parsed = new URL(link.target_url);
    if (!["http:", "https:", "tel:", "mailto:", "sms:", "geo:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }
    targetUrl = parsed.toString();
  } catch {
    // Non-URL content (text, vcard, etc.) — show inline
    isRedirectable = false;
    targetUrl = link.target_url;
  }

  if (!isRedirectable) {
    return new Response(targetUrl, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const url = new URL(request.url);
  const consent = url.searchParams.get("consent");
  const extendedPrivacy = process.env.FEATURE_EXTENDED_PRIVACY === "true";

  // ── Extended privacy: show interstitial ────────────────────
  if (extendedPrivacy && !consent) {
    return renderInterstitial(id, targetUrl);
  }

  // ── Determine tracking scope ───────────────────────────────
  const fullTracking = !extendedPrivacy || consent === "full";

  const trackingConfig = {
    clicks: true, // always track clicks
    timestamps: fullTracking && process.env.TRACKING_TIMESTAMPS !== "false",
    browser: fullTracking && process.env.TRACKING_BROWSER !== "false",
    os: fullTracking && process.env.TRACKING_OS !== "false",
    geo: fullTracking && process.env.TRACKING_GEO === "true",
    referrer: fullTracking && process.env.TRACKING_REFERRER !== "false",
    uniqueVisitors: fullTracking && process.env.TRACKING_UNIQUE_VISITORS === "true",
    ipSalt: process.env.TRACKING_IP_SALT || "default-salt",
  };

  // Fire and forget — don't block the redirect
  recordScan(id, request, trackingConfig).catch((err) =>
    console.error("Failed to record scan:", err)
  );

  return NextResponse.redirect(targetUrl, 302);
}

// ── Interstitial HTML ──────────────────────────────────────────
function renderInterstitial(id: string, targetUrl: string): Response {
  // Detect preferred language from Accept-Language header
  const siteName = process.env.SITE_NAME || "Awesome QR Code";
  const primaryColor = process.env.PRIMARY_COLOR || "#6366f1";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(siteName)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fafafa;color:#18181b}
    @media(prefers-color-scheme:dark){body{background:#09090b;color:#fafafa}}
    .card{max-width:28rem;width:100%;margin:1rem;padding:2rem;border-radius:0.75rem;border:1px solid #e4e4e7;background:#fff}
    @media(prefers-color-scheme:dark){.card{background:#18181b;border-color:#27272a}}
    h1{font-size:1.25rem;font-weight:700;margin-bottom:0.25rem}
    .url{font-size:0.875rem;color:#71717a;word-break:break-all;margin-bottom:1.5rem}
    .buttons{display:flex;flex-direction:column;gap:0.75rem}
    .btn{display:block;width:100%;padding:0.75rem 1rem;border-radius:0.5rem;font-size:0.875rem;font-weight:600;text-align:center;text-decoration:none;cursor:pointer;border:none;transition:opacity 0.15s}
    .btn-primary{background:${escapeHtml(primaryColor)};color:#fff}
    .btn-primary:hover{opacity:0.9}
    .btn-secondary{background:transparent;color:inherit;border:1px solid #e4e4e7}
    @media(prefers-color-scheme:dark){.btn-secondary{border-color:#3f3f46}}
    .btn-secondary:hover{background:#f4f4f5}
    @media(prefers-color-scheme:dark){.btn-secondary:hover{background:#27272a}}
    .hint{font-size:0.75rem;color:#a1a1aa;margin-top:0.25rem;text-align:center}
  </style>
</head>
<body>
  <div class="card">
    <h1>Redirect / Weiterleitung</h1>
    <p class="url">${escapeHtml(targetUrl)}</p>
    <div class="buttons">
      <a class="btn btn-primary" href="/s/${encodeURIComponent(id)}?consent=full">
        Visit / Aufrufen
      </a>
      <p class="hint">Includes anonymous usage statistics / Inkl. anonymer Nutzungsstatistik</p>
      <a class="btn btn-secondary" href="/s/${encodeURIComponent(id)}?consent=minimal">
        Continue without tracking / Weiter ohne Tracking
      </a>
      <p class="hint">Only counts the click / Zählt nur den Klick</p>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
