"use client";

import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/copy-button";
import type { StatsOverview } from "@/types/config";
import { formatNumber } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  stats: StatsOverview;
}

export function StatsDashboard({ stats }: Props) {
  const t = useTranslations("stats");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-border p-4 space-y-2">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>
            <strong>{t("qrType")}:</strong> {stats.qrType}
          </span>
          <span>
            <strong>{t("createdAt")}:</strong> {stats.createdAt}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <strong>{t("shortLink")}:</strong>
          <code className="text-xs">{stats.shortLinkUrl}</code>
          <CopyButton text={stats.shortLinkUrl} />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard label={t("totalScans")} value={formatNumber(stats.totalScans)} />
        <KPICard
          label={t("uniqueVisitors")}
          value={formatNumber(stats.uniqueVisitors)}
        />
      </div>

      {/* Timeline chart */}
      {stats.timeline.length > 0 && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-sm font-semibold">{t("timeline")}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.timeline}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top lists */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TopList title={t("topBrowsers")} items={stats.topBrowsers.map((b) => ({ label: b.browser, count: b.count }))} />
        <TopList title={t("topOS")} items={stats.topOS.map((o) => ({ label: o.os, count: o.count }))} />
        <TopList title={t("topCountries")} items={stats.topCountries.map((c) => ({ label: c.country, count: c.count }))} />
        <TopList title={t("topReferrers")} items={stats.topReferrers.map((r) => ({ label: r.referrer || "Direct", count: r.count }))} />
      </div>
    </div>
  );
}

function KPICard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function TopList({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">—</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.slice(0, 5).map((item) => (
            <li key={item.label} className="flex justify-between">
              <span className="truncate">{item.label}</span>
              <span className="font-medium">{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
