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
 * on the privacy policy page, based on which features are active.
 */
export function getPrivacySections(features: PrivacyFeatures): string[] {
  const sections: string[] = ["intro"];

  // Operator info — always shown
  sections.push("operator");

  // Base data-collection statement
  sections.push("collection");

  // Tracking details — only if analytics feature is on
  if (features.featureAnalytics) {
    sections.push("tracking");
    sections.push("selfHosted");
  }

  // Third-party analytics
  if (features.googleAnalyticsId) {
    sections.push("google");
  }
  if (features.cloudflareAnalyticsToken) {
    sections.push("cloudflare");
  }

  // Public API
  if (features.featureSwagger) {
    sections.push("api");
  }

  // Always: cookies, rights, retention, changes
  sections.push("cookies", "rights");

  if (features.featureAnalytics) {
    sections.push("retention");
  }

  sections.push("changes");

  return sections;
}

/**
 * Return only the tracking items that are actually enabled,
 * so the privacy page can list precisely what is collected.
 */
export function getActiveTrackingItems(
  scope: PrivacyFeatures["trackingScope"]
): string[] {
  const items: string[] = [];
  if (scope.clicks) items.push("clicks");
  if (scope.timestamps) items.push("timestamps");
  if (scope.browser) items.push("browser");
  if (scope.os) items.push("os");
  if (scope.geo) items.push("geo");
  if (scope.referrer) items.push("referrer");
  if (scope.uniqueVisitors) items.push("unique");
  return items;
}
