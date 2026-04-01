"use client";

import Script from "next/script";
import { useConfig } from "@/components/config-provider";
import {
  CookieConsentBanner,
  useCookieConsent,
} from "@/components/cookie-consent";

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

  // Nothing to load → render nothing
  if (!hasExternalAnalytics) return null;

  // Extended privacy: need consent first
  if (extendedPrivacy && consent === null) {
    return <CookieConsentBanner onAccept={accept} onDecline={decline} />;
  }

  // Extended privacy: user declined → no scripts
  if (extendedPrivacy && consent === false) return null;

  // Either no extended privacy, or user accepted → load scripts
  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
      {cfToken && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token":"${cfToken}"}`}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
