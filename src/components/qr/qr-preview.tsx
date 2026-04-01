"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { QRStyleOptions } from "@/types/qr";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

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
  const [visible, setVisible] = useState(true);

  // Debounce inputs to avoid flickering during rapid changes
  const stableInput = useMemo(() => ({ data, style }), [data, style]);
  const debounced = useDebounce(stableInput, 350);

  const render = useCallback(async () => {
    if (!containerRef.current || !debounced.data) return;

    // Fade out
    setVisible(false);

    const QRCodeStyling = (await import("qr-code-styling")).default;
    const s = debounced.style;

    const dotsOptions: Record<string, unknown> = {
      type: s.dotStyle,
    };

    if (s.gradientEnabled) {
      dotsOptions.gradient = {
        type: s.gradientType,
        colorStops: [
          { offset: 0, color: s.fgColor },
          { offset: 1, color: s.gradientColorEnd },
        ],
      };
    } else {
      dotsOptions.color = s.fgColor;
    }

    const PREVIEW_SIZE = 300;

    const options: Record<string, unknown> = {
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      data: debounced.data,
      margin: s.margin,
      qrOptions: {
        errorCorrectionLevel: s.errorCorrectionLevel,
      },
      dotsOptions,
      backgroundOptions: { color: s.bgColor },
      cornersSquareOptions: { type: s.cornerSquareStyle },
      cornersDotOptions: { type: s.cornerDotStyle },
    };

    if (s.logoDataUrl) {
      options.image = s.logoDataUrl;
      options.imageOptions = {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: s.logoRatio,
        hideBackgroundDots: true,
      };
    }

    const qr = new QRCodeStyling(options as never);
    containerRef.current.innerHTML = "";
    qr.append(containerRef.current);
    instanceRef.current = qr;
    onInstanceReady?.(qr);

    // Fade in after render
    requestAnimationFrame(() => setVisible(true));

    // Simple scannability heuristic: logo > 25% with low EC
    if (
      s.logoDataUrl &&
      s.logoRatio > 0.25 &&
      s.errorCorrectionLevel !== "H"
    ) {
      setWarning(true);
    } else {
      setWarning(false);
    }
  }, [debounced, onInstanceReady]);

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
        className="flex items-center justify-center rounded-lg border border-border bg-white p-4 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      />
      {warning && (
        <p className="text-xs text-destructive">{t("scanWarning")}</p>
      )}
    </div>
  );
}
