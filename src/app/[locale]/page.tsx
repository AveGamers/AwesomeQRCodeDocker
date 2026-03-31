import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  QrCode,
  Palette,
  BarChart3,
  Shield,
  UserX,
  Github,
} from "lucide-react";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  const features = [
    { key: "types", icon: QrCode },
    { key: "customization", icon: Palette },
    { key: "analytics", icon: BarChart3 },
    { key: "privacy", icon: Shield },
    { key: "noAccount", icon: UserX },
    { key: "openSource", icon: Github },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {t("hero.subtitle")}
        </p>
        <Link
          href="/generate"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <QrCode className="h-5 w-5" />
          {t("hero.cta")}
        </Link>
      </section>

      {/* Features */}
      <section className="mt-24">
        <h2 className="text-center text-2xl font-bold">{t("features.title")}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="rounded-lg border border-border p-6 transition-colors hover:border-primary/30"
            >
              <Icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">
                {t(`features.${key}.title`)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
