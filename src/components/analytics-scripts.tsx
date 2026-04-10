"use client";

import { useEffect } from "react";
import { useConfig } from "@/components/config-provider";
import {
  CookieConsentBanner,
  useCookieConsent,
} from "@/components/cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_SCRIPT_ID = "analytics-ga-src";
const CF_SCRIPT_ID = "analytics-cf-src";

/**
 * Loads Google Analytics / Cloudflare Web Analytics scripts.
 *
 * When `featureExtendedPrivacy` is on, scripts only load after
 * the user accepts the cookie consent banner.
 * When it's off, scripts load immediately (no banner shown).
 */
export function AnalyticsScripts() {
  const config = useConfig();
  const { consent, accept, decline } = useCookieConsent();

  const gaId = config.googleAnalyticsId;
  const cfToken = config.cloudflareAnalyticsToken;
  const hasExternalAnalytics = !!(gaId || cfToken);
  const extendedPrivacy = config.featureExtendedPrivacy;
  const shouldLoadAnalytics =
    hasExternalAnalytics && (!extendedPrivacy || consent === true);

  useEffect(() => {
    function removeScript(id: string) {
      document.getElementById(id)?.remove();
    }

    if (!shouldLoadAnalytics) {
      removeScript(GA_SCRIPT_ID);
      removeScript(CF_SCRIPT_ID);
      return;
    }

    if (gaId && !document.getElementById(GA_SCRIPT_ID)) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", gaId);

      const gaScript = document.createElement("script");
      gaScript.id = GA_SCRIPT_ID;
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(gaScript);
    }

    if (cfToken && !document.getElementById(CF_SCRIPT_ID)) {
      const cfScript = document.createElement("script");
      cfScript.id = CF_SCRIPT_ID;
      cfScript.defer = true;
      cfScript.src = "https://static.cloudflareinsights.com/beacon.min.js";
      cfScript.setAttribute("data-cf-beacon", JSON.stringify({ token: cfToken }));
      document.head.appendChild(cfScript);
    }
  }, [cfToken, gaId, shouldLoadAnalytics]);

  // Nothing to load → render nothing
  if (!hasExternalAnalytics) return null;

  // Extended privacy: need consent first
  if (extendedPrivacy && consent === null) {
    return <CookieConsentBanner onAccept={accept} onDecline={decline} />;
  }

  // Extended privacy: user declined → no scripts
  if (extendedPrivacy && consent === false) return null;

  return null;
}
