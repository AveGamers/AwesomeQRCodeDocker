interface PrivacyFeatures {
  featureAnalytics: boolean;
  googleAnalyticsId: string;
  cloudflareAnalyticsToken: string;
  featureSwagger: boolean;
  trackingScope: {
    clicks: boolean;
    timestamps: boolean;
    browser: boolean;
    os: boolean;
    geo: boolean;
    referrer: boolean;
    uniqueVisitors: boolean;
  };
}

/**
 * Return the ordered list of section keys that should be rendered
 * on the privacy policy page.
 *
 * All sections are included by default so the generated policy
 * covers the maximum possible scope. Operators should review and
 * remove sections that don't apply to their deployment.
 */
export function getPrivacySections(_features: PrivacyFeatures): string[] {
  return [
    "intro",
    "operator",
    "collection",
    "tracking",
    "selfHosted",
    "google",
    "cloudflare",
    "api",
    "cookies",
    "rights",
    "retention",
    "changes",
  ];
}

/**
 * Return all tracking item keys so the privacy page lists
 * the full scope of what can be collected.
 */
export function getActiveTrackingItems(
  _scope: PrivacyFeatures["trackingScope"]
): string[] {
  return ["clicks", "timestamps", "browser", "os", "geo", "referrer", "unique"];
}
