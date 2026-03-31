export interface PublicConfig {
  siteName: string;
  siteDescription: string;
  siteClaim: string;
  siteLogoUrl: string;
  publicBaseUrl: string;
  shortLinkDomain: string;
  featureAnalytics: boolean;
  featureSwagger: boolean;
  trackingDefaultEnabled: boolean;
  defaultTheme: string;
  primaryColor: string;
  defaultLocale: string;
  availableLocales: string[];
  qrDefaultSize: number;
  qrDefaultErrorCorrection: string;
  qrMaxLogoRatio: number;
  googleAnalyticsId: string;
  cloudflareAnalyticsToken: string;
  footerText: string;
  hasImprint: boolean;
  trackingScope: TrackingScope;
}

export interface TrackingScope {
  clicks: boolean;
  timestamps: boolean;
  browser: boolean;
  os: boolean;
  geo: boolean;
  referrer: boolean;
  uniqueVisitors: boolean;
}

export interface ImprintData {
  company: string;
  address: string;
  email: string;
  phone: string;
  register: string;
  vatId: string;
  responsible: string;
  customHtml: string;
}

export interface ScanEvent {
  id: number;
  shortLinkId: string;
  scannedAt: Date;
  ipHash: string | null;
  country: string | null;
  region: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
}

export interface StatsOverview {
  totalScans: number;
  uniqueVisitors: number;
  topCountries: { country: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
  topOS: { os: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  timeline: { date: string; count: number }[];
  shortLinkId: string;
  shortLinkUrl: string;
  qrType: string;
  targetContent: string;
  createdAt: string;
}
