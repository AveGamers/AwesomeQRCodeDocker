"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { QRStyleOptions } from "@/types/qr";

interface Props {
  data: string;
  style: QRStyleOptions;
  onInstanceReady?: (instance: unknown) => void;
}

export function QRPreview({ data, style, onInstanceReady }: Props) {
  const t = useTranslations("generator.preview");
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<unknown>(null);
  const [warning, setWarning] = useState(false);

  const render = useCallback(async () => {
    if (!containerRef.current || !data) return;

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
      qrOptions: {
        errorCorrectionLevel: style.errorCorrectionLevel,
      },
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
    containerRef.current.innerHTML = "";
    qr.append(containerRef.current);
    instanceRef.current = qr;
    onInstanceReady?.(qr);

    // Simple scannability heuristic: logo > 25% with low EC
    if (
      style.logoDataUrl &&
      style.logoRatio > 0.25 &&
      style.errorCorrectionLevel !== "H"
    ) {
      setWarning(true);
    } else {
      setWarning(false);
    }
  }, [data, style, onInstanceReady]);

  useEffect(() => {
    render();
  }, [render]);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="flex items-center justify-center rounded-lg border border-border bg-white p-4"
      />
      {warning && (
        <p className="text-xs text-destructive">{t("scanWarning")}</p>
      )}
    </div>
  );
}
