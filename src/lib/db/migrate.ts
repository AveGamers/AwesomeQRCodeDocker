import { sql, type Kysely } from "kysely";
import type { Database } from "./schema";
import { getDb } from "./index";

export async function migrate() {
  const db = getDb();
  await createTables(db);
  console.log("✅ Database migrations complete");
}

export async function createTables(db: Kysely<Database>) {
  await db.schema
    .createTable("tracked_qrs")
    .ifNotExists()
    .addColumn("id", "varchar(21)", (col) => col.primaryKey())
    .addColumn("type", "varchar(20)", (col) => col.notNull())
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("style_options", "text")
    .addColumn("canonical_base_url", "varchar(500)", (col) => col.notNull())
    .addColumn("stats_token", "varchar(32)", (col) => col.notNull().unique())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("expires_at", "timestamp")
    .execute();

  await db.schema
    .createTable("short_links")
    .ifNotExists()
    .addColumn("id", "varchar(12)", (col) => col.primaryKey())
    .addColumn("qr_id", "varchar(21)", (col) => col.notNull())
    .addColumn("target_url", "text", (col) => col.notNull())
    .addColumn("canonical_base_url", "varchar(500)", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) =>
      col.notNull().defaultTo(sql`true`)
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();

  try {
    await db.schema
      .alterTable("short_links")
      .addColumn("is_active", "boolean", (col) =>
        col.notNull().defaultTo(sql`true`)
      )
      .execute();
  } catch {
    // Column already exists on upgraded instances.
  }

  await db.schema
    .createTable("scan_events")
    .ifNotExists()
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("short_link_id", "varchar(12)", (col) => col.notNull())
    .addColumn("scanned_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("ip_hash", "varchar(64)")
    .addColumn("country", "varchar(2)")
    .addColumn("region", "varchar(100)")
    .addColumn("browser", "varchar(100)")
    .addColumn("os", "varchar(100)")
    .addColumn("referrer", "text")
    .addColumn("user_agent", "text")
    .execute();

  // Indexes — idempotent thanks to ifNotExists
  try {
    await db.schema
      .createIndex("idx_short_links_qr_id")
      .ifNotExists()
      .on("short_links")
      .column("qr_id")
      .execute();

    await db.schema
      .createIndex("idx_scan_events_short_link_id")
      .ifNotExists()
      .on("scan_events")
      .column("short_link_id")
      .execute();

    await db.schema
      .createIndex("idx_scan_events_scanned_at")
      .ifNotExists()
      .on("scan_events")
      .column("scanned_at")
      .execute();
  } catch {
    // Some dialects silently ignore duplicate index creation, others throw.
  }
}

// Allow running directly: tsx src/lib/db/migrate.ts
if (process.argv[1]?.includes("src/lib/db/migrate.ts")) {
  migrate().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
