"use client";

import { useEffect, useState } from "react";
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
    errorCorrectionLevel:
      config.qrDefaultErrorCorrection as QRStyleOptions["errorCorrectionLevel"],
  });
  const [trackingEnabled, setTrackingEnabled] = useState(
    config.trackingDefaultEnabled
  );
  const [showEmbeddedTarget, setShowEmbeddedTarget] = useState(true);
  const [trackedQrId, setTrackedQrId] = useState<string | null>(null);
  const [trackedShortId, setTrackedShortId] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [statsLink, setStatsLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [trackingActivated, setTrackingActivated] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const qrFields = toQRFields(qrType, fields);
  let payload = "";
  try {
    payload = buildPayload(qrFields);
  } catch {
    // incomplete fields, no payload yet
  }

  const payloadKey = payload ? `${qrType}:${payload}` : null;
  const qrData = trackingEnabled && shortLink ? shortLink : payload;

  function resetTrackingState() {
    setTrackedQrId(null);
    setTrackedShortId(null);
    setDraftKey(null);
    setShortLink(null);
    setStatsLink(null);
    setTrackingActivated(false);
    setTrackingError(null);
    setCreating(false);
    setActivating(false);
  }

  function handleTypeChange(newType: QRType) {
    setQRType(newType);
    setFields({});
    resetTrackingState();
  }

  useEffect(() => {
    if (!config.featureAnalytics || !trackingEnabled) {
      resetTrackingState();
      return;
    }

    if (!payloadKey || !payload) {
      resetTrackingState();
      return;
    }

    if (draftKey === payloadKey && shortLink) {
      return;
    }

    const timer = window.setTimeout(async () => {
      setCreating(true);
      setTrackingError(null);

      try {
        const method = trackedQrId && trackedShortId ? "PUT" : "POST";
        const res = await fetch("/api/shortlink", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrId: trackedQrId,
            shortId: trackedShortId,
            type: qrType,
            content: payload,
            styleOptions: style,
            activate: false,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create short link");
        }

        setTrackedQrId(data.qrId);
        setTrackedShortId(data.shortId);
        setDraftKey(payloadKey);
        setShortLink(data.shortLinkUrl);
        setStatsLink(data.statsUrl || `/${locale}/stats/${data.statsToken}`);
        setTrackingActivated(Boolean(data.isActive));
      } catch (e) {
        console.error(e);
        setTrackingError(e instanceof Error ? e.message : tCommon("error"));
      } finally {
        setCreating(false);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    config.featureAnalytics,
    draftKey,
    locale,
    payload,
    payloadKey,
    qrType,
    shortLink,
    style,
    tCommon,
    trackedQrId,
    trackedShortId,
    trackingEnabled,
  ]);

  async function handleActivateTrackedQR() {
    if (!config.featureAnalytics || !payload || !trackedQrId || !trackedShortId) {
      return;
    }

    setActivating(true);
    setTrackingError(null);

    try {
      const res = await fetch("/api/shortlink", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrId: trackedQrId,
          shortId: trackedShortId,
          type: qrType,
          content: payload,
          styleOptions: style,
          activate: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to activate short link");
      }

      setDraftKey(payloadKey);
      setShortLink(data.shortLinkUrl);
      setStatsLink(data.statsUrl || `/${locale}/stats/${data.statsToken}`);
      setTrackingActivated(Boolean(data.isActive));
    } catch (e) {
      console.error(e);
      setTrackingError(e instanceof Error ? e.message : tCommon("error"));
    } finally {
      setActivating(false);
    }
  }

  return (
    <div className="space-y-6">
      <QRTypeSelector value={qrType} onChange={handleTypeChange} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4">
            <QRForm type={qrType} fields={fields} onChange={setFields} />
          </div>

          <div className="rounded-lg border border-border p-4">
            <QRStyleOptionsPanel style={style} onChange={setStyle} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="sticky top-20">
            <h3 className="mb-2 text-sm font-semibold">{t("preview.title")}</h3>
            <QRPreview data={qrData} style={style} />

            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={showEmbeddedTarget}
                    onChange={(e) => setShowEmbeddedTarget(e.target.checked)}
                    className="rounded border-input"
                  />
                  {t("preview.showEmbeddedTarget")}
                </label>
              </div>

              {payload && showEmbeddedTarget && (
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {tStats("target")}
                      </p>
                      <p className="mt-1 break-all text-sm">{payload}</p>
                    </div>
                    <CopyButton text={payload} className="shrink-0" />
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold">{t("tracking.title")}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("tracking.enableHint")}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={trackingEnabled}
                      onChange={(e) => {
                        setTrackingEnabled(e.target.checked);
                        if (!e.target.checked) {
                          resetTrackingState();
                        }
                      }}
                      className="rounded border-input"
                    />
                    {t("tracking.enable")}
                  </label>
                </div>

                {config.featureAnalytics ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-border bg-background/60 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {t("tracking.enabledProsTitle")}
                      </p>
                      <p className="mt-1">{t("tracking.enabledProsText")}</p>
                    </div>
                    <div className="rounded-md border border-border bg-background/60 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {t("tracking.disabledProsTitle")}
                      </p>
                      <p className="mt-1">{t("tracking.disabledProsText")}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("tracking.unavailable")}
                  </p>
                )}

                {trackingEnabled && config.featureAnalytics && !payload && (
                  <p className="text-xs text-muted-foreground">
                    {t("tracking.fillFieldsFirst")}
                  </p>
                )}

                {trackingEnabled && config.featureAnalytics && payload && shortLink && (
                  <div className="space-y-3">
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

                {trackingEnabled && config.featureAnalytics && payload && !trackingActivated && (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                    {t("tracking.activationWarning")}
                  </div>
                )}

                {trackingError && (
                  <p className="text-xs text-destructive">{trackingError}</p>
                )}

                {trackingEnabled && config.featureAnalytics && payload && (
                  <button
                    onClick={handleActivateTrackedQR}
                    disabled={creating || activating || !shortLink || trackingActivated}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {activating
                      ? t("tracking.activating")
                      : trackingActivated
                        ? t("tracking.active")
                        : t("tracking.activate")}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <QRExport siteName={config.siteName} data={qrData} style={style} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
