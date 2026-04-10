import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { recordScan } from "@/lib/analytics/tracker";
import { detectTargetPageLanguage, renderTrackedTargetPage } from "@/lib/qr/target-page";
import { isTrackedTargetPageType } from "@/lib/qr/target-details";

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
    .innerJoin("tracked_qrs", "tracked_qrs.id", "short_links.qr_id")
    .select([
      "short_links.id as id",
      "short_links.target_url as target_url",
      "short_links.is_active as is_active",
      "tracked_qrs.type as qr_type",
      "tracked_qrs.content as qr_content",
      "tracked_qrs.fields_json as qr_fields_json",
    ])
    .where("short_links.id", "=", id)
    .executeTakeFirst();

  if (!link) {
    return NextResponse.json({ error: "Short link not found" }, { status: 404 });
  }

  if (!link.is_active || link.is_active === 0) {
    return renderInactiveLinkPage();
  }

  const isTargetPage = isTrackedTargetPageType(link.qr_type);
  let targetUrl = link.target_url;

  if (!isTargetPage) {
    try {
      const parsed = new URL(link.target_url);
      if (!["http:", "https:", "tel:", "mailto:", "sms:", "geo:"].includes(parsed.protocol)) {
        return NextResponse.json({ error: "Invalid target" }, { status: 400 });
      }
      targetUrl = parsed.toString();
    } catch {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }
  }

  const url = new URL(request.url);
  const consent = url.searchParams.get("consent");
  const extendedPrivacy = process.env.FEATURE_EXTENDED_PRIVACY === "true";

  // ── Extended privacy: show interstitial ────────────────────
  if (extendedPrivacy && !consent) {
    return renderInterstitial(
      id,
      isTargetPage ? `${new URL(request.url).origin}/s/${encodeURIComponent(id)}` : targetUrl,
      isTargetPage
    );
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

  if (isTargetPage) {
    const siteName = process.env.SITE_NAME || "Awesome QR Code";
    const primaryColor = process.env.PRIMARY_COLOR || "#6366f1";
    const language = detectTargetPageLanguage(request);

    return new Response(
      renderTrackedTargetPage({
        type: link.qr_type,
        content: link.qr_content,
        fieldsJson: link.qr_fields_json,
        siteName,
        primaryColor,
        shortId: id,
        language,
      }),
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return NextResponse.redirect(targetUrl, 302);
}

// ── Interstitial HTML ──────────────────────────────────────────
function renderInterstitial(id: string, targetUrl: string, isTargetPage: boolean): Response {
  // Detect preferred language from Accept-Language header
  const siteName = process.env.SITE_NAME || "Awesome QR Code";
  const primaryColor = process.env.PRIMARY_COLOR || "#6366f1";
  const title = isTargetPage
    ? "Open target page / Zielseite öffnen"
    : "Redirect / Weiterleitung";
  const primaryCta = isTargetPage ? "Open / Öffnen" : "Visit / Aufrufen";

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
    <h1>${title}</h1>
    <p class="url">${escapeHtml(targetUrl)}</p>
    <div class="buttons">
      <a class="btn btn-primary" href="/s/${encodeURIComponent(id)}?consent=full">
        ${primaryCta}
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

function renderInactiveLinkPage(): Response {
  const siteName = process.env.SITE_NAME || "Awesome QR Code";

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
    .card{max-width:32rem;width:100%;margin:1rem;padding:2rem;border-radius:0.75rem;border:1px solid #e4e4e7;background:#fff}
    @media(prefers-color-scheme:dark){.card{background:#18181b;border-color:#27272a}}
    h1{font-size:1.25rem;font-weight:700;margin-bottom:0.75rem}
    p{font-size:0.95rem;line-height:1.6;color:#52525b}
    @media(prefers-color-scheme:dark){p{color:#a1a1aa}}
  </style>
</head>
<body>
  <div class="card">
    <h1>Tracking link not active yet / Tracking-Link noch nicht aktiv</h1>
    <p>This QR code points to a draft tracking link and will only work after it has been activated by the creator.</p>
    <p>Dieser QR-Code zeigt auf einen Tracking-Entwurf und funktioniert erst, nachdem er vom Ersteller aktiviert wurde.</p>
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
