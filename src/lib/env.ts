import { z } from "zod";

const boolStr = z
  .enum(["true", "false", "1", "0", ""])
  .default("false")
  .transform((v) => v === "true" || v === "1");

const envSchema = z.object({
  // Runtime
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("production"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  // Public domain / URLs
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  SHORT_LINK_DOMAIN: z.string().default(""),
  BASE_PATH: z.string().default(""),

  // Reverse proxy
  TRUST_PROXY: boolStr,
  TRUSTED_PROXIES: z.string().default(""),

  // CORS
  CORS_ALLOWED_ORIGINS: z.string().default(""),
  CORS_ALLOWED_METHODS: z.string().default("GET,POST,OPTIONS"),
  CORS_ALLOWED_HEADERS: z.string().default("Content-Type,Authorization"),
  CORS_MAX_AGE: z.coerce.number().default(86400),

  // Feature toggles
  FEATURE_ANALYTICS: boolStr,
  FEATURE_SWAGGER: boolStr,
  FEATURE_GEOIP: boolStr,
  FEATURE_EXTENDED_PRIVACY: boolStr,

  // Database (only needed when analytics is on)
  DATABASE_DIALECT: z
    .enum(["postgres", "mysql", "sqlite"])
    .default("sqlite"),
  DATABASE_URL: z.string().default("file:./data/awesome-qr.db"),

  // Tracking
  TRACKING_DEFAULT_ENABLED: boolStr,
  TRACKING_CLICKS: boolStr.default("true"),
  TRACKING_TIMESTAMPS: boolStr.default("true"),
  TRACKING_BROWSER: boolStr.default("true"),
  TRACKING_OS: boolStr.default("true"),
  TRACKING_GEO: boolStr,
  TRACKING_REFERRER: boolStr.default("true"),
  TRACKING_UNIQUE_VISITORS: boolStr,
  TRACKING_IP_SALT: z
    .string()
    .default("change-me-to-a-random-string"),
  TRACKING_RETENTION_DAYS: z.coerce.number().default(90),

  // External analytics
  GOOGLE_ANALYTICS_ID: z.string().default(""),
  CLOUDFLARE_ANALYTICS_TOKEN: z.string().default(""),

  // SEO
  SITE_NAME: z.string().default("Awesome QR Code"),
  SITE_DESCRIPTION: z
    .string()
    .default("Free, fast & customizable QR Code Generator"),
  SITE_KEYWORDS: z.string().default("QR Code,Generator,Free,Analytics,Short Link"),
  OG_IMAGE_URL: z.string().default(""),
  TWITTER_HANDLE: z.string().default(""),
  ROBOTS_POLICY: z.string().default("index,follow"),

  // Branding
  SITE_CLAIM: z
    .string()
    .default("Generate beautiful QR codes in seconds"),
  SITE_LOGO_URL: z.string().default(""),
  FOOTER_TEXT: z.string().default(""),

  // i18n
  DEFAULT_LOCALE: z.string().default("en"),
  AVAILABLE_LOCALES: z.string().default("en,de"),

  // Theme
  DEFAULT_THEME: z.enum(["light", "dark", "system"]).default("system"),
  PRIMARY_COLOR: z.string().default("#6366f1"),

  // QR defaults
  QR_DEFAULT_SIZE: z.coerce.number().min(100).max(2000).default(300),
  QR_DEFAULT_ERROR_CORRECTION: z
    .enum(["L", "M", "Q", "H"])
    .default("M"),
  QR_MAX_LOGO_RATIO: z.coerce.number().min(0).max(0.3).default(0.2),

  // Rate limiting
  RATE_LIMIT_ENABLED: boolStr.default("true"),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  // Imprint
  IMPRINT_COMPANY: z.string().default(""),
  IMPRINT_ADDRESS: z.string().default(""),
  IMPRINT_EMAIL: z.string().default(""),
  IMPRINT_PHONE: z.string().default(""),
  IMPRINT_REGISTER: z.string().default(""),
  IMPRINT_VAT_ID: z.string().default(""),
  IMPRINT_RESPONSIBLE: z.string().default(""),
  IMPRINT_CUSTOM_HTML: z.string().default(""),

  // Privacy
  PRIVACY_CONTACT_EMAIL: z.string().default(""),
  PRIVACY_DPO_EMAIL: z.string().default(""),
  PRIVACY_CUSTOM_SECTIONS: z.string().default(""),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  return result.data;
}

export const env = parseEnv();

/** Subset of env that is safe to expose to the client. */
export function getPublicConfig() {
  return {
    siteName: env.SITE_NAME,
    siteDescription: env.SITE_DESCRIPTION,
    siteClaim: env.SITE_CLAIM,
    siteLogoUrl: env.SITE_LOGO_URL,
    publicBaseUrl: env.PUBLIC_BASE_URL,
    shortLinkDomain: env.SHORT_LINK_DOMAIN || env.PUBLIC_BASE_URL,
    featureAnalytics: env.FEATURE_ANALYTICS,
    featureSwagger: env.FEATURE_SWAGGER,
    featureExtendedPrivacy: env.FEATURE_EXTENDED_PRIVACY,
    trackingDefaultEnabled: env.TRACKING_DEFAULT_ENABLED,
    defaultTheme: env.DEFAULT_THEME,
    primaryColor: env.PRIMARY_COLOR,
    defaultLocale: env.DEFAULT_LOCALE,
    availableLocales: env.AVAILABLE_LOCALES.split(",").map((l) => l.trim()),
    qrDefaultSize: env.QR_DEFAULT_SIZE,
    qrDefaultErrorCorrection: env.QR_DEFAULT_ERROR_CORRECTION,
    qrMaxLogoRatio: env.QR_MAX_LOGO_RATIO,
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
    cloudflareAnalyticsToken: env.CLOUDFLARE_ANALYTICS_TOKEN,
    footerText: env.FOOTER_TEXT,
    hasImprint: !!(env.IMPRINT_COMPANY || env.IMPRINT_EMAIL),
    trackingScope: {
      clicks: env.TRACKING_CLICKS,
      timestamps: env.TRACKING_TIMESTAMPS,
      browser: env.TRACKING_BROWSER,
      os: env.TRACKING_OS,
      geo: env.TRACKING_GEO,
      referrer: env.TRACKING_REFERRER,
      uniqueVisitors: env.TRACKING_UNIQUE_VISITORS,
    },
  };
}

export type PublicConfig = ReturnType<typeof getPublicConfig>;
