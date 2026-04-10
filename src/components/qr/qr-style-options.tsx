"use client";

import { useTranslations } from "next-intl";
import type {
  QRStyleOptions,
  DotStyle,
  CornerSquareStyle,
  CornerDotStyle,
  ErrorCorrectionLevel,
} from "@/types/qr";
import { useConfig } from "@/components/config-provider";
import { useCallback } from "react";

interface Props {
  style: QRStyleOptions;
  onChange: (style: QRStyleOptions) => void;
}

export function QRStyleOptionsPanel({ style, onChange }: Props) {
  const t = useTranslations("generator.style");
  const config = useConfig();

  const set = useCallback(
    <K extends keyof QRStyleOptions>(key: K, value: QRStyleOptions[K]) => {
      onChange({ ...style, [key]: value });
    },
    [style, onChange]
  );

  const inputCls =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "block text-sm font-medium mb-1";

  const dotStyles: DotStyle[] = [
    "square",
    "rounded",
    "dots",
    "classy",
    "classy-rounded",
    "extra-rounded",
  ];
  const cornerSquareStyles: CornerSquareStyle[] = [
    "square",
    "dot",
    "extra-rounded",
  ];
  const cornerDotStyles: CornerDotStyle[] = ["square", "dot"];
  const ecLevels: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{t("title")}</h3>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t("foreground")}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.fgColor}
              onChange={(e) => set("fgColor", e.target.value)}
              className="h-9 w-9 cursor-pointer rounded border border-input"
            />
            <input
              type="text"
              value={style.fgColor}
              onChange={(e) => set("fgColor", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>{t("background")}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.bgColor}
              onChange={(e) => set("bgColor", e.target.value)}
              className="h-9 w-9 cursor-pointer rounded border border-input"
            />
            <input
              type="text"
              value={style.bgColor}
              onChange={(e) => set("bgColor", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Gradient */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={style.gradientEnabled}
          onChange={(e) => set("gradientEnabled", e.target.checked)}
          className="rounded border-input"
        />
        {t("gradientEnabled")}
      </label>
      {style.gradientEnabled && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("gradientType")}</label>
            <select
              className={inputCls}
              value={style.gradientType}
              onChange={(e) =>
                set("gradientType", e.target.value as "linear" | "radial")
              }
            >
              <option value="linear">{t("linear")}</option>
              <option value="radial">{t("radial")}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("gradientColorEnd")}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.gradientColorEnd}
                onChange={(e) => set("gradientColorEnd", e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border border-input"
              />
              <input
                type="text"
                value={style.gradientColorEnd}
                onChange={(e) => set("gradientColorEnd", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dot / corner styles */}
      <div>
        <label className={labelCls}>{t("dotStyle")}</label>
        <select
          className={inputCls}
          value={style.dotStyle}
          onChange={(e) => set("dotStyle", e.target.value as DotStyle)}
        >
          {dotStyles.map((s) => (
            <option key={s} value={s}>
              {t(`styles.${s === "classy-rounded" ? "classyRounded" : s === "extra-rounded" ? "extraRounded" : s}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t("cornerSquareStyle")}</label>
          <select
            className={inputCls}
            value={style.cornerSquareStyle}
            onChange={(e) =>
              set("cornerSquareStyle", e.target.value as CornerSquareStyle)
            }
          >
            {cornerSquareStyles.map((s) => (
              <option key={s} value={s}>
                {t(`styles.${s === "extra-rounded" ? "extraRounded" : s}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{t("cornerDotStyle")}</label>
          <select
            className={inputCls}
            value={style.cornerDotStyle}
            onChange={(e) =>
              set("cornerDotStyle", e.target.value as CornerDotStyle)
            }
          >
            {cornerDotStyles.map((s) => (
              <option key={s} value={s}>
                {t(`styles.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error correction */}
      <div>
        <label className={labelCls}>{t("errorCorrection")}</label>
        <select
          className={inputCls}
          value={style.errorCorrectionLevel}
          onChange={(e) =>
            set(
              "errorCorrectionLevel",
              e.target.value as ErrorCorrectionLevel
            )
          }
        >
          {ecLevels.map((l) => (
            <option key={l} value={l}>
              {t(`ecLevels.${l}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Size & margin */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t("size")} — {style.size}px</label>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={style.size}
            onChange={(e) => set("size", Number(e.target.value))}
            className="w-full"
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("sizeHint")}</p>
        </div>
        <div>
          <label className={labelCls}>{t("margin")} — {style.margin}px</label>
          <input
            type="range"
            min={0}
            max={50}
            value={style.margin}
            onChange={(e) => set("margin", Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={style.embedTargetLabel}
          onChange={(e) => set("embedTargetLabel", e.target.checked)}
          className="rounded border-input"
        />
        {t("embedTargetLabel")}
      </label>

      {/* Logo upload */}
      <div>
        <label className={labelCls}>{t("logo")}</label>
        <p className="mb-2 text-xs text-muted-foreground">
          {t("logoHint", { ratio: Math.round(config.qrMaxLogoRatio * 100) })}
        </p>
        {style.logoDataUrl ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={style.logoDataUrl}
              alt="Logo preview"
              className="h-12 w-12 rounded border border-border object-contain"
            />
            <button
              onClick={() => set("logoDataUrl", null)}
              className="text-sm text-destructive hover:underline"
            >
              {t("logoRemove")}
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/png,image/svg+xml,image/jpeg,image/webp"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                // Batch both changes to avoid the second overwriting the first
                const updates: Partial<QRStyleOptions> = { logoDataUrl: dataUrl };
                if (style.errorCorrectionLevel !== "H") {
                  updates.errorCorrectionLevel = "H";
                }
                onChange({ ...style, ...updates });
              };
              reader.readAsDataURL(file);
            }}
          />
        )}
      </div>
    </div>
  );
}
