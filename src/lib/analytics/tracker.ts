import { createHash } from "crypto";
import { ensureDbReady } from "@/lib/db";
import { UAParser } from "ua-parser-js";

interface TrackingConfig {
  clicks: boolean;
  timestamps: boolean;
  browser: boolean;
  os: boolean;
  geo: boolean;
  referrer: boolean;
  uniqueVisitors: boolean;
  ipSalt: string;
}

/**
 * Record a scan event for a short-link redirect.
 * Only collects data points that are enabled in the tracking config.
 */
export async function recordScan(
  shortLinkId: string,
  request: Request,
  config: TrackingConfig
) {
  const db = await ensureDbReady();
  const ua = request.headers.get("user-agent") || "";
  const parser = new UAParser(ua);
  const browserResult = parser.getBrowser();
  const osResult = parser.getOS();

  const ipHash = config.uniqueVisitors
    ? hashIP(getClientIP(request), config.ipSalt)
    : null;

  await db
    .insertInto("scan_events")
    .values({
      short_link_id: shortLinkId,
      ip_hash: ipHash,
      browser: config.browser ? (browserResult.name ?? null) : null,
      os: config.os ? (osResult.name ?? null) : null,
      referrer: config.referrer
        ? (request.headers.get("referer") || null)
        : null,
      user_agent: ua || null,
      country: null, // filled by GeoIP middleware if enabled
      region: null,
    })
    .execute();
}

function getClientIP(request: Request): string {
  const trustProxy = process.env.TRUST_PROXY === "true";

  if (trustProxy) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    const real = request.headers.get("x-real-ip");
    if (real) return real;
  }

  return "0.0.0.0";
}

function hashIP(ip: string, salt: string): string {
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}
