"use client";

import { useTranslations } from "next-intl";
import { QrCode } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useConfig } from "@/components/config-provider";
import { Link } from "@/i18n/navigation";

export function Header() {
  const t = useTranslations("nav");
  const config = useConfig();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <QrCode className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">{config.siteName}</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/generate"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-accent"
          >
            {t("generate")}
          </Link>
          {config.featureSwagger && (
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a
              href="/api/docs"
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-accent"
            >
              {t("apiDocs")}
            </a>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
