# Awesome QR Code Docker

Self-hosted QR code generation with Docker, Next.js and optional scan analytics.

Create styled QR codes for URLs, text, WiFi, phone numbers, emails, SMS, locations, events and contacts. Run it with SQLite out of the box or switch to PostgreSQL / MariaDB when analytics and shared persistence matter.

<p align="center">
	<img src="./image.png" alt="Awesome QR Code Docker screenshot" width="1200" />
</p>

## Highlights

- 9 QR types: URL, text, WiFi, phone, email, SMS, location, event and contact
- Extensive styling: colors, gradients, corner styles, logo overlay and export options
- Optional tracking: short links, scan statistics, activation flow and locale-aware stats pages
- Privacy-aware setup: analytics off by default, optional cookie consent and extended privacy mode
- Self-hosted friendly: Docker, GHCR publishing, reverse proxy support and runtime env-based configuration
- Internationalized UI: English and German included
- Database flexibility: SQLite, PostgreSQL or MariaDB / MySQL

## What It Does Well

This project is built for teams and self-hosters who want more than a one-off QR generator.

- Direct QR generation without any login flow
- Optional tracked QR codes with short links and scan insights
- Dedicated landing pages for tracked non-URL QR types like WiFi, text, contact and event
- Branding and legal pages driven by environment variables
- Good defaults for local setups, with enough knobs for production deployments

## Quick Start

### Docker Compose: SQLite

```bash
git clone https://github.com/AveGamers/AwesomeQRCodeDocker.git
cd AwesomeQRCodeDocker
cp .env.example .env
docker compose up -d
```

App URL: `http://localhost:3000`

After changing values in `.env`, recreate the container so the runtime config is refreshed:

```bash
docker compose up -d --force-recreate
```

### Docker Compose: PostgreSQL

```bash
cp .env.example .env
docker compose -f docker-compose.postgres.yml up -d
```

Use this in `.env` when you want the bundled PostgreSQL service:

```env
DATABASE_DIALECT=postgres
DATABASE_URL=postgresql://awesome_qr:changeme@postgres:5432/awesome_qr
```

### Docker Compose: MariaDB

```bash
cp .env.example .env
docker compose -f docker-compose.mariadb.yml up -d
```

Use this in `.env` when you want the bundled MariaDB service:

```env
DATABASE_DIALECT=mysql
DATABASE_URL=mysql://awesome_qr:changeme@mariadb:3306/awesome_qr
```

### Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Useful scripts:

```bash
npm run dev
npm run build
npm run lint
npm run db:migrate
```

## Feature Overview

| Area | Included |
|---|---|
| QR types | URL, text, WiFi, phone, email, SMS, geo, event, vCard |
| Styling | foreground/background colors, gradients, dot styles, corner styles, logo overlay |
| Export | PNG and SVG, with size control and embedded target labels |
| Tracking | short links, draft activation flow, scan stats, optional browser / OS / geo / referrer metrics |
| Privacy | cookie consent, extended-privacy redirect choice, generated privacy page |
| Deployment | Dockerfile, Compose files, GHCR-ready release workflow |

## Tracking And Privacy

Tracking is optional and disabled by default.

- `FEATURE_ANALYTICS=false`: no short-link workflow, no scan statistics, no database required
- `FEATURE_ANALYTICS=true`: tracked QR codes, short links and statistics become available
- `FEATURE_EXTENDED_PRIVACY=true`: cookie consent for external analytics and an interstitial choice page for tracked redirects

Tracked non-URL QR codes do not just dump raw payload text anymore. They open dedicated target pages that present the saved values cleanly for:

- Text
- WiFi
- Phone
- Email
- SMS
- Location
- Event
- Contact

If tracking is disabled, the actual payload is embedded directly into the QR code as expected.

## Configuration

Everything is configured via environment variables. The full list lives in [.env.example](.env.example).

| Category | Important variables | Purpose |
|---|---|---|
| Runtime | `PORT`, `NODE_ENV`, `LOG_LEVEL` | App runtime behavior |
| Public URLs | `PUBLIC_BASE_URL`, `SHORT_LINK_DOMAIN`, `BASE_PATH` | Canonical URLs, short links and reverse-proxy subpaths |
| Reverse proxy | `TRUST_PROXY`, `TRUSTED_PROXIES` | Respect forwarded headers safely |
| CORS | `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_METHODS`, `CORS_ALLOWED_HEADERS` | Cross-origin API control |
| Feature flags | `FEATURE_ANALYTICS`, `FEATURE_SWAGGER`, `FEATURE_GEOIP`, `FEATURE_EXTENDED_PRIVACY` | Toggle optional modules |
| Database | `DATABASE_DIALECT`, `DATABASE_URL` | `sqlite`, `postgres`, or `mysql` |
| Tracking | `TRACKING_*`, `TRACKING_IP_SALT`, `TRACKING_RETENTION_DAYS` | Scan data scope and retention |
| External analytics | `GOOGLE_ANALYTICS_ID`, `CLOUDFLARE_ANALYTICS_TOKEN` | Website analytics, separate from QR scan tracking |
| Branding / SEO | `SITE_*`, `PRIMARY_COLOR`, `OG_IMAGE_URL`, `FOOTER_TEXT` | Site appearance and metadata |
| i18n / theme | `DEFAULT_LOCALE`, `AVAILABLE_LOCALES`, `DEFAULT_THEME` | Language and theme defaults |
| Legal | `IMPRINT_*`, `PRIVACY_*`, `PRIVACY_CUSTOM_SECTIONS` | Imprint and privacy content |

## API

The app includes a small API for programmatic use. Swagger / OpenAPI docs are available at `/api/docs` when `FEATURE_SWAGGER=true`.

| Endpoint | Method | Description |
|---|---|---|
| `/api/qr` | `POST` | Generate a QR code as PNG or SVG |
| `/api/shortlink` | `POST`, `PUT` | Create or update tracked short links |
| `/api/stats/{token}` | `GET` | Read scan statistics as JSON |
| `/api/health` | `GET` | Health check for Docker / probes |
| `/s/{id}` | `GET` | Resolve tracked QR short links |

## Project Structure

```text
src/
├── app/
│   ├── [locale]/          # localized pages: generator, privacy, imprint, stats
│   ├── api/               # REST endpoints
│   └── s/[id]/            # tracked short-link resolver
├── components/            # generator UI, layout, stats, shared client components
├── i18n/                  # locale routing and navigation helpers
├── lib/                   # env parsing, db access, QR payloads, analytics, privacy
└── types/                 # shared TypeScript models
messages/                  # translation files
docker-compose*.yml        # SQLite, PostgreSQL and MariaDB setups
```

Core stack: Next.js 15, React 19, Tailwind CSS, Kysely, next-intl, next-themes, qr-code-styling and Zod.

## Docker And Releases

The repository includes:

- A production Dockerfile based on Node 24
- A default SQLite Compose setup
- Separate Compose files for PostgreSQL and MariaDB
- GHCR publishing via GitHub Actions
- Multi-arch release images for `linux/amd64` and `linux/arm64`

Tagged releases publish `latest` and version tags. Pushes to `staging` publish a `staging` image.

Example pull:

```bash
docker pull ghcr.io/<owner>/<repo>:latest
```

## Notes For Production

- Set a real `PUBLIC_BASE_URL`
- Change `TRACKING_IP_SALT`
- Recreate containers after `.env` changes
- Use PostgreSQL or MariaDB when multiple app instances should share analytics data
- Keep `FEATURE_ANALYTICS=false` if you only need plain QR generation

## License

See [LICENSE](LICENSE).
