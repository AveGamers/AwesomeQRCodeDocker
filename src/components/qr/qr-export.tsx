"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import type { QRStyleOptions } from "@/types/qr";

interface Props {
  siteName: string;
  data: string;
  style: QRStyleOptions;
  targetLabel?: string;
  trackingEnabled: boolean;
}

interface QRCodeInstance {
  download: (opts: { name: string; extension: string }) => Promise<void>;
  getRawData?: (extension: "png" | "svg") => Promise<Blob>;
}

function buildFileName(
  siteName: string,
  targetLabel: string | undefined,
  size: number,
  trackingEnabled: boolean
) {
  const rawLabel = targetLabel || "qr";
  const compactLabel = rawLabel
    .replace(/^https?:\/\//i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "qr";

  return `${siteName.replace(/\s+/g, "_")}_${compactLabel}_${size}px_${trackingEnabled ? "tracking-on" : "tracking-off"}`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function wrapTextForCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function QRExport({ siteName, data, style, targetLabel, trackingEnabled }: Props) {
  const t = useTranslations("generator.export");

  async function buildQrInstance() {
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

    return new QRCodeStyling(options as never) as QRCodeInstance;
  }

  async function downloadFile(ext: "png" | "svg") {
    if (!data) return;

    const fileName = buildFileName(
      siteName,
      targetLabel,
      style.size,
      trackingEnabled
    );
    const qr = await buildQrInstance();

    if (!style.embedTargetLabel || !targetLabel) {
      await qr.download({ name: fileName, extension: ext });
      return;
    }

    if (!qr.getRawData) {
      await qr.download({ name: fileName, extension: ext });
      return;
    }

    const rawBlob = await qr.getRawData(ext);

    if (ext === "png") {
      const imageUrl = URL.createObjectURL(rawBlob);
      const image = new Image();
      image.src = imageUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Failed to render PNG export"));
      });

      const padding = 16;
      const textAreaWidth = style.size + padding * 2 - 20;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.font = '16px sans-serif';
      const lines = wrapTextForCanvas(ctx, targetLabel, textAreaWidth);
      const lineHeight = 20;
      const labelHeight = lines.length * lineHeight + 18;

      canvas.width = style.size + padding * 2;
      canvas.height = style.size + padding * 2 + labelHeight;

      ctx.fillStyle = style.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, padding, padding, style.size, style.size);
      ctx.fillStyle = style.fgColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          canvas.width / 2,
          padding + style.size + 8 + index * lineHeight
        );
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((nextBlob) => resolve(nextBlob), "image/png")
      );
      URL.revokeObjectURL(imageUrl);
      if (blob) {
        downloadBlob(blob, `${fileName}.png`);
      }
      return;
    }

    const svgText = await rawBlob.text();
    const padding = 16;
    const approxCharsPerLine = Math.max(12, Math.floor(style.size / 10));
    const lines = targetLabel.match(new RegExp(`.{1,${approxCharsPerLine}}`, "g")) || [targetLabel];
    const lineHeight = 20;
    const labelHeight = lines.length * lineHeight + 18;
    const totalWidth = style.size + padding * 2;
    const totalHeight = style.size + padding * 2 + labelHeight;
    const encodedSvg = typeof btoa === "function"
      ? btoa(unescape(encodeURIComponent(svgText)))
      : svgText;
    const composedSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <rect width="100%" height="100%" fill="${escapeXml(style.bgColor)}"/>
  <image href="data:image/svg+xml;base64,${encodedSvg}" x="${padding}" y="${padding}" width="${style.size}" height="${style.size}"/>
  ${lines
    .map(
      (line, index) =>
        `<text x="${totalWidth / 2}" y="${padding + style.size + 20 + index * lineHeight}" text-anchor="middle" font-family="sans-serif" font-size="14" fill="${escapeXml(style.fgColor)}">${escapeXml(line)}</text>`
    )
    .join("")}
</svg>`.trim();

    downloadBlob(new Blob([composedSvg], { type: "image/svg+xml" }), `${fileName}.svg`);
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
