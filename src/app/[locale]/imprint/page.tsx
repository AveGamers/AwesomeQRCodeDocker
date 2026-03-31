import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Imprint" };

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("imprint");

  const data = {
    company: process.env.IMPRINT_COMPANY || "",
    address: process.env.IMPRINT_ADDRESS || "",
    email: process.env.IMPRINT_EMAIL || "",
    phone: process.env.IMPRINT_PHONE || "",
    register: process.env.IMPRINT_REGISTER || "",
    vatId: process.env.IMPRINT_VAT_ID || "",
    responsible: process.env.IMPRINT_RESPONSIBLE || "",
    customHtml: process.env.IMPRINT_CUSTOM_HTML || "",
  };

  const hasAny = data.company || data.email;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      {!hasAny ? (
        <p className="text-muted-foreground">{t("notConfigured")}</p>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
          {data.company && (
            <div>
              <strong>{t("company")}</strong>
              <p>{data.company}</p>
            </div>
          )}
          {data.address && (
            <div>
              <strong>{t("address")}</strong>
              <p className="whitespace-pre-line">{data.address}</p>
            </div>
          )}
          {(data.email || data.phone) && (
            <div>
              <strong>{t("contact")}</strong>
              {data.email && (
                <p>
                  {t("email")}: <a href={`mailto:${data.email}`}>{data.email}</a>
                </p>
              )}
              {data.phone && (
                <p>
                  {t("phone")}: {data.phone}
                </p>
              )}
            </div>
          )}
          {data.register && (
            <div>
              <strong>{t("register")}</strong>
              <p>{data.register}</p>
            </div>
          )}
          {data.vatId && (
            <div>
              <strong>{t("vatId")}</strong>
              <p>{data.vatId}</p>
            </div>
          )}
          {data.responsible && (
            <div>
              <strong>{t("responsible")}</strong>
              <p>{data.responsible}</p>
            </div>
          )}
          {data.customHtml && (
            <div dangerouslySetInnerHTML={{ __html: data.customHtml }} />
          )}
        </div>
      )}
    </div>
  );
}
