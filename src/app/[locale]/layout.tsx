import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { ConfigProvider } from "@/components/config-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { getPublicConfig } from "@/lib/env";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const config = getPublicConfig();
  const { locale } = await params;
  return {
    title: {
      default: config.siteName,
      template: `%s | ${config.siteName}`,
    },
    description: config.siteDescription,
    keywords: process.env.SITE_KEYWORDS?.split(","),
    metadataBase: new URL(config.publicBaseUrl),
    alternates: {
      canonical: "/",
      languages: Object.fromEntries(
        config.availableLocales.map((l) => [l, `/${l}`])
      ),
    },
    openGraph: {
      title: config.siteName,
      description: config.siteDescription,
      url: config.publicBaseUrl,
      siteName: config.siteName,
      locale,
      type: "website",
      ...(config.siteLogoUrl ? { images: [config.siteLogoUrl] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: config.siteName,
      description: config.siteDescription,
    },
    robots: process.env.ROBOTS_POLICY || "index,follow",
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const config = getPublicConfig();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <ConfigProvider config={config}>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <AnalyticsScripts />
            </ConfigProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
