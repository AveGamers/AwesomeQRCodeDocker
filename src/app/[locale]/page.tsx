import { getTranslations, setRequestLocale } from "next-intl/server";
import { QRGenerator } from "@/components/qr/qr-generator";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("generator");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
      <QRGenerator />
    </div>
  );
}
