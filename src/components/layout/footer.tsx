"use client";

import { useTranslations } from "next-intl";
import { useConfig } from "@/components/config-provider";
import { Link } from "@/i18n/navigation";

const REPOSITORY_URL = "https://github.com/AveGamers/AwesomeQRCodeDocker";

export function Footer() {
  const t = useTranslations();
  const config = useConfig();

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            {t("nav.privacy")}
          </Link>
          {config.hasImprint && (
            <Link href="/imprint" className="hover:text-foreground transition-colors">
              {t("nav.imprint")}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          {config.footerText ? (
            <span>{config.footerText}</span>
          ) : (
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
              aria-label={t("footer.source")}
            >
              {t("footer.madeWith")}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
