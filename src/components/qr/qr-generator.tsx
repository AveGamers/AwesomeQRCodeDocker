"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useConfig } from "@/components/config-provider";
import { CopyButton } from "@/components/copy-button";
import { QRTypeSelector } from "./qr-type-selector";
import { QRForm, toQRFields } from "./qr-form";
import { QRStyleOptionsPanel } from "./qr-style-options";
import { QRPreview } from "./qr-preview";
import { QRExport } from "./qr-export";
import { buildPayload } from "@/lib/qr/payloads";
import type { QRType, QRStyleOptions } from "@/types/qr";
import { DEFAULT_STYLE } from "@/types/qr";
import { ExternalLink, BarChart3 } from "lucide-react";

export function QRGenerator() {
  const t = useTranslations("generator");
  const tCommon = useTranslations("common");
  const tStats = useTranslations("stats");
  const locale = useLocale();
  const config = useConfig();

  const [qrType, setQRType] = useState<QRType>("url");
  const [fields, setFields] = useState<Record<string, string | boolean>>({});
  const [style, setStyle] = useState<QRStyleOptions>({
    ...DEFAULT_STYLE,
    size: config.qrDefaultSize,
    errorCorrectionLevel: config.qrDefaultErrorCorrection as QRStyleOptions["errorCorrectionLevel"],
  });
  const [trackingEnabled, setTrackingEnabled] = useState(
    config.trackingDefaultEnabled
  );
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [statsLink, setStatsLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Build payload from current fields
  const qrFields = toQRFields(qrType, fields);
  let payload = "";
  try {
    payload = buildPayload(qrFields);
  } catch {
    // incomplete fields, no payload yet
  }

  const qrData = trackingEnabled && shortLink ? shortLink : payload;

  function handleTypeChange(newType: QRType) {
    setQRType(newType);
    setFields({});
    setShortLink(null);
    setStatsLink(null);
  }

  async function handleCreateTrackedQR() {
    if (!payload || !config.featureAnalytics) return;
    setCreating(true);
    setTrackingError(null);
    try {
      const res = await fetch("/api/shortlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: qrType,
          content: payload,
          styleOptions: style,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create short link");
      }
      setShortLink(data.shortLinkUrl);
      setStatsLink(data.statsUrl || `/${locale}/stats/${data.statsToken}`);
    } catch (e) {
      console.error(e);
      setTrackingError(
        e instanceof Error ? e.message : tCommon("error")
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Type selector */}
      <QRTypeSelector value={qrType} onChange={handleTypeChange} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: inputs + style */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4">
            <QRForm type={qrType} fields={fields} onChange={setFields} />
          </div>

          <div className="rounded-lg border border-border p-4">
            <QRStyleOptionsPanel style={style} onChange={setStyle} />
          </div>

          {/* Tracking toggle */}
          {config.featureAnalytics ? (
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold">{t("tracking.title")}</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={trackingEnabled}
                  onChange={(e) => {
                    setTrackingEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setShortLink(null);
                      setStatsLink(null);
                    }
                  }}
                  className="rounded border-input"
                />
                {t("tracking.enable")}
              </label>
              <p className="text-xs text-muted-foreground">
                {t("tracking.enableHint")}
              </p>

              {trackingEnabled && payload && (
                <button
                  onClick={handleCreateTrackedQR}
                  disabled={creating || !!shortLink}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {creating ? t("tracking.title") + "…" : tCommon("generate")}
                </button>
              )}

              {trackingError && (
                <p className="text-xs text-destructive">{trackingError}</p>
              )}

            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("tracking.unavailable")}
            </p>
          )}
        </div>

        {/* Right: preview + export */}
        <div className="space-y-4">
          <div className="sticky top-20">
            <h3 className="mb-2 text-sm font-semibold">{t("preview.title")}</h3>
            <QRPreview
              data={qrData}
              style={style}
            />
            {payload && (
              <div className="mt-4 space-y-3 rounded-lg border border-border bg-secondary/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {tStats("target")}
                    </p>
                    <p className="mt-1 break-all text-sm">{payload}</p>
                  </div>
                  <CopyButton text={payload} className="shrink-0" />
                </div>

                {shortLink && (
                  <div className="flex items-start gap-3">
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("tracking.shortLink")}
                      </p>
                      <p className="mt-1 break-all text-sm">{shortLink}</p>
                    </div>
                    <CopyButton text={shortLink} className="shrink-0" />
                  </div>
                )}

                {statsLink && (
                  <div className="flex items-start gap-3">
                    <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("tracking.statsLink")}
                      </p>
                      <a
                        href={statsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block break-all text-sm text-primary underline"
                      >
                        {statsLink}
                      </a>
                    </div>
                    <CopyButton text={statsLink} className="shrink-0" />
                  </div>
                )}
              </div>
            )}
            <div className="mt-4">
              <QRExport
                siteName={config.siteName}
                data={qrData}
                style={style}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
