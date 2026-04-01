"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import type { QRStyleOptions } from "@/types/qr";

interface Props {
  siteName: string;
  data: string;
  style: QRStyleOptions;
}

export function QRExport({ siteName, data, style }: Props) {
  const t = useTranslations("generator.export");

  async function downloadFile(ext: "png" | "svg") {
    if (!data) return;

    // Create a full-resolution instance for download using style.size
    const QRCodeStyling = (await import("qr-code-styling")).default;

    const dotsOptions: Record<string, unknown> = {
      type: style.dotStyle,
    };
    if (style.gradientEnabled) {
      dotsOptions.gradient = {
        type: style.gradientType,
        colorStops: [
          { offset: 0, color: style.fgColor },
          { offset: 1, color: style.gradientColorEnd },
        ],
      };
    } else {
      dotsOptions.color = style.fgColor;
    }

    const options: Record<string, unknown> = {
      width: style.size,
      height: style.size,
      data,
      margin: style.margin,
      qrOptions: { errorCorrectionLevel: style.errorCorrectionLevel },
      dotsOptions,
      backgroundOptions: { color: style.bgColor },
      cornersSquareOptions: { type: style.cornerSquareStyle },
      cornersDotOptions: { type: style.cornerDotStyle },
    };

    if (style.logoDataUrl) {
      options.image = style.logoDataUrl;
      options.imageOptions = {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: style.logoRatio,
        hideBackgroundDots: true,
      };
    }

    const qr = new QRCodeStyling(options as never);
    await (qr as { download: (opts: { name: string; extension: string }) => Promise<void> }).download({
      name: `${siteName.replace(/\s+/g, "_")}_QR`,
      extension: ext,
    });
  }

  const logoIsSvg = style.logoDataUrl?.startsWith("data:image/svg") ?? false;
  const svgDisabled = !data || (!!style.logoDataUrl && !logoIsSvg);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => downloadFile("png")}
        disabled={!data}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {t("png")}
      </button>
      <button
        onClick={() => downloadFile("svg")}
        disabled={svgDisabled}
        title={svgDisabled && !!style.logoDataUrl ? t("svgLogoHint") : undefined}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {t("svg")}
      </button>
    </div>
  );
}
