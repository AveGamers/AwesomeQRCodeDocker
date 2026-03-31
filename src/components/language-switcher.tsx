"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const locales = ["en", "de"] as const;

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className="rounded-md border border-border bg-secondary/50 px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {t(l)}
          </option>
        ))}
      </select>
    </div>
  );
}
