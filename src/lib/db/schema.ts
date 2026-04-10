import type { Generated, ColumnType } from "kysely";

export interface Database {
  tracked_qrs: TrackedQRsTable;
  short_links: ShortLinksTable;
  scan_events: ScanEventsTable;
}

export interface TrackedQRsTable {
  id: string;
  type: string;
  content: string;
  style_options: string | null;
  canonical_base_url: string;
  stats_token: string;
  created_at: ColumnType<Date, string | undefined, never>;
  expires_at: ColumnType<Date | null, string | null | undefined, string | null>;
}

export interface ShortLinksTable {
  id: string;
  qr_id: string;
  target_url: string;
  canonical_base_url: string;
  is_active: ColumnType<boolean | number, boolean | number, boolean | number>;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface ScanEventsTable {
  id: Generated<number>;
  short_link_id: string;
  scanned_at: ColumnType<Date, string | undefined, never>;
  ip_hash: string | null;
  country: string | null;
  region: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  user_agent: string | null;
}
