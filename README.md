# Awesome QR Code Docker

A self-hosted, feature-rich QR Code Generator built with **Next.js 15**, fully configured via environment variables, and deployed with **Docker**.

---

## Features

- **9 QR Types** — URL, Text, WiFi, Phone, Email, SMS, Location, Event, vCard
- **Full Styling** — Colors, gradients, dot/corner shapes, logo overlay with transparency
- **Optional Analytics** — Short links with scan tracking (clicks, browser, OS, geo, referrer)
- **Multi-Language** — English & German out of the box (extensible)
- **Dark / Light Mode** — System-aware with manual toggle
- **Multi-Database** — PostgreSQL, MariaDB, or SQLite
- **SEO Optimized** — OpenGraph, Twitter Cards, canonical URLs, JSON-LD ready
- **Privacy Aware** — Feature-flag-driven privacy policy, no tracking by default
- **Optional Swagger** — Toggle API documentation via env
- **Docker + GHCR** — Multi-arch images, health checks, Compose profiles

## Quick Start

### Docker Compose (recommended)

```bash
# 1. Clone the repo
git clone https://github.com/AveGamers/AwesomeQRCodeDocker.git
cd AwesomeQRCodeDocker

# 2. Copy and edit env
cp .env.example .env

# 3. Start (SQLite, no extras)
docker compose up -d

# With PostgreSQL:
# docker compose --profile postgres up -d

# With MariaDB:
# docker compose --profile mariadb up -d
```

The app is available at **http://localhost:3000**.

### Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

### Database Migration

Tables are created automatically on first use. To run migrations manually:

```bash
npx tsx src/lib/db/migrate.ts
```

## Configuration

All settings live in `.env`. See [.env.example](.env.example) for every option.

| Category | Key Variables | Notes |
|---|---|---|
| **Runtime** | `PORT`, `NODE_ENV` | Default 3000 |
| **URLs** | `PUBLIC_BASE_URL`, `SHORT_LINK_DOMAIN` | Short link domain defaults to base URL |
| **Features** | `FEATURE_ANALYTICS`, `FEATURE_SWAGGER`, `FEATURE_GEOIP` | All `false` by default |
| **Database** | `DATABASE_DIALECT`, `DATABASE_URL` | `sqlite`, `postgres`, or `mysql` |
| **Tracking** | `TRACKING_*` | 9 granular toggles + salt + retention |
| **SEO** | `SITE_NAME`, `SITE_DESCRIPTION`, `OG_IMAGE_URL` | |
| **Branding** | `SITE_CLAIM`, `SITE_LOGO_URL`, `FOOTER_TEXT` | |
| **Imprint** | `IMPRINT_COMPANY`, `IMPRINT_ADDRESS`, … | German Impressum |
| **Privacy** | `PRIVACY_CONTACT_EMAIL`, `PRIVACY_DPO_EMAIL` | |
| **i18n** | `DEFAULT_LOCALE`, `AVAILABLE_LOCALES` | `en`, `de` |
| **Theme** | `DEFAULT_THEME` | `system`, `light`, or `dark` |
| **Rate Limit** | `RATE_LIMIT_ENABLED`, `RATE_LIMIT_MAX` | |

## API

When `FEATURE_SWAGGER=true`, the OpenAPI spec is served at `/api/docs`.

| Endpoint | Method | Description |
|---|---|---|
| `/api/qr` | POST | Generate QR code (PNG/SVG) |
| `/api/shortlink` | POST | Create tracked short link |
| `/api/stats/{token}` | GET | Scan statistics |
| `/api/health` | GET | Health check |
| `/s/{id}` | GET | Short link redirect |

## Architecture

```
Next.js 15 (App Router, standalone output)
├── src/app/[locale]/     # i18n pages (landing, generator, stats, privacy, imprint)
├── src/app/api/          # REST endpoints
├── src/app/s/[id]/       # Short link redirect
├── src/components/       # React components (QR generator, stats dashboard, layout)
├── src/lib/              # Core logic (env, db, QR payloads, analytics, privacy)
├── src/i18n/             # next-intl routing & config
└── messages/             # Translation files (en.json, de.json)
```

**Stack:** Next.js 15 · React 19 · Tailwind CSS · Kysely · next-intl · next-themes · qr-code-styling · Zod

## Docker Images

Multi-arch images (`amd64` + `arm64`) are published to GHCR on every tagged release:

```bash
docker pull ghcr.io/YOUR_USER/awesomeqrcodedocker:latest
```

GitHub Actions workflows:
- **CI** — lint + build on every PR and push to `main`
- **Release** — multi-arch build & push to GHCR on `v*` tags

## License

See [LICENSE](LICENSE).
