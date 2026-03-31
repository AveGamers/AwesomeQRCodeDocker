import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublicConfig } from "@/lib/env";
import {
  getPrivacySections,
  getActiveTrackingItems,
} from "@/lib/privacy/policy-builder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");
  const config = getPublicConfig();

  const sections = getPrivacySections({
    featureAnalytics: config.featureAnalytics,
    googleAnalyticsId: config.googleAnalyticsId,
    cloudflareAnalyticsToken: config.cloudflareAnalyticsToken,
    featureSwagger: config.featureSwagger,
    trackingScope: config.trackingScope,
  });

  const activeItems = getActiveTrackingItems(config.trackingScope);

  const companyInfo =
    process.env.IMPRINT_COMPANY || config.siteName;
  const contactEmail =
    process.env.PRIVACY_CONTACT_EMAIL || process.env.IMPRINT_EMAIL || "—";
  const retentionDays = process.env.TRACKING_RETENTION_DAYS || "90";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {t("lastUpdated", { date: new Date().toLocaleDateString() })}
      </p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        {sections.map((sectionKey) => (
          <section key={sectionKey}>
            <h2>{t(`sections.${sectionKey}.title`)}</h2>
            <p>
              {t(`sections.${sectionKey}.content`, {
                siteName: config.siteName,
                companyInfo,
                contactEmail,
                retentionDays,
              })}
            </p>

            {/* Tracking items list */}
            {sectionKey === "tracking" && activeItems.length > 0 && (
              <>
                <ul>
                  {activeItems.map((item) => (
                    <li key={item}>{t(`sections.tracking.items.${item}`)}</li>
                  ))}
                </ul>
                <p className="text-sm italic">
                  {t("sections.tracking.ipNote")}
                </p>
              </>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
        <strong>Hinweis / Notice:</strong> This is an auto-generated privacy
        policy based on the features enabled on this instance. It is intended as
        a starting point. The operator is responsible for verifying legal
        compliance.
      </div>
    </div>
  );
}
