import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ensureDbReady } from "@/lib/db";
import { StatsDashboard } from "@/components/stats/stats-dashboard";
import { sql } from "kysely";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Statistics" };
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("stats");

  // Feature check
  if (process.env.FEATURE_ANALYTICS !== "true") {
    notFound();
  }

  const db = await ensureDbReady();

  // Find the tracked QR by stats token
  const qr = await db
    .selectFrom("tracked_qrs")
    .selectAll()
    .where("stats_token", "=", token)
    .executeTakeFirst();

  if (!qr) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
      </div>
    );
  }

  // Get short link
  const shortLink = await db
    .selectFrom("short_links")
    .selectAll()
    .where("qr_id", "=", qr.id)
    .executeTakeFirst();

  const shortLinkId = shortLink?.id ?? "";

  // Aggregate stats
  const totalScans =
    (
      await db
        .selectFrom("scan_events")
        .select(db.fn.countAll().as("count"))
        .where("short_link_id", "=", shortLinkId)
        .executeTakeFirst()
    )?.count ?? 0;

  const uniqueVisitors =
    (
      await db
        .selectFrom("scan_events")
        .select(
          sql<number>`COUNT(DISTINCT ip_hash)`.as("count")
        )
        .where("short_link_id", "=", shortLinkId)
        .executeTakeFirst()
    )?.count ?? 0;

  const topBrowsers = await db
    .selectFrom("scan_events")
    .select(["browser", db.fn.countAll().as("count")])
    .where("short_link_id", "=", shortLinkId)
    .where("browser", "is not", null)
    .groupBy("browser")
    .orderBy("count", "desc")
    .limit(5)
    .execute();

  const topOS = await db
    .selectFrom("scan_events")
    .select(["os", db.fn.countAll().as("count")])
    .where("short_link_id", "=", shortLinkId)
    .where("os", "is not", null)
    .groupBy("os")
    .orderBy("count", "desc")
    .limit(5)
    .execute();

  const topCountries = await db
    .selectFrom("scan_events")
    .select(["country", db.fn.countAll().as("count")])
    .where("short_link_id", "=", shortLinkId)
    .where("country", "is not", null)
    .groupBy("country")
    .orderBy("count", "desc")
    .limit(5)
    .execute();

  const topReferrers = await db
    .selectFrom("scan_events")
    .select(["referrer", db.fn.countAll().as("count")])
    .where("short_link_id", "=", shortLinkId)
    .where("referrer", "is not", null)
    .groupBy("referrer")
    .orderBy("count", "desc")
    .limit(5)
    .execute();

  const shortLinkDomain =
    process.env.SHORT_LINK_DOMAIN || process.env.PUBLIC_BASE_URL || "";

  const stats = {
    totalScans: Number(totalScans),
    uniqueVisitors: Number(uniqueVisitors),
    topBrowsers: topBrowsers.map((r) => ({
      browser: r.browser || "Unknown",
      count: Number(r.count),
    })),
    topOS: topOS.map((r) => ({
      os: r.os || "Unknown",
      count: Number(r.count),
    })),
    topCountries: topCountries.map((r) => ({
      country: r.country || "??",
      count: Number(r.count),
    })),
    topReferrers: topReferrers.map((r) => ({
      referrer: r.referrer || "Direct",
      count: Number(r.count),
    })),
    timeline: [],
    shortLinkId,
    shortLinkUrl: `${shortLinkDomain}/s/${shortLinkId}`,
    qrType: qr.type,
    targetContent: qr.content,
    createdAt: new Date(qr.created_at).toLocaleDateString(locale),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
      <StatsDashboard stats={stats} />
    </div>
  );
}
