"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

interface Props {
  qrInstance: unknown;
  siteName: string;
}

export function QRExport({ qrInstance, siteName }: Props) {
  const t = useTranslations("generator.export");

  async function downloadFile(ext: "png" | "svg") {
    if (!qrInstance) return;
    const instance = qrInstance as {
      download: (opts: { name: string; extension: string }) => Promise<void>;
    };
    await instance.download({
      name: `${siteName.replace(/\s+/g, "_")}_QR`,
      extension: ext,
    });
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => downloadFile("png")}
        disabled={!qrInstance}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {t("png")}
      </button>
      <button
        onClick={() => downloadFile("svg")}
        disabled={!qrInstance}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {t("svg")}
      </button>
    </div>
  );
}
