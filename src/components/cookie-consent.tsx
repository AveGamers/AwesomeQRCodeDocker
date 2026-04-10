"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const CONSENT_KEY = "aqr_analytics_consent";

export function useCookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "true") setConsent(true);
    else if (stored === "false") setConsent(false);
    // null = not yet decided
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "true");
    setConsent(true);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "false");
    setConsent(false);
  }

  return { consent, accept, decline };
}

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

export function CookieConsentBanner({ onAccept, onDecline }: Props) {
  const t = useTranslations("cookieConsent");

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">{t("message")}</p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onDecline}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            {t("decline")}
          </button>
          <button
            onClick={onAccept}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
