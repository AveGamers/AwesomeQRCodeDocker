import { buildPayload } from "@/lib/qr/payloads";
import type { QRFields } from "@/types/qr";
import {
  getFallbackTargetDisplayItems,
  getQRTargetDisplayItems,
  parseStoredQRFields,
} from "@/lib/qr/target-details";

type SupportedLanguage = "de" | "en";

interface RenderTrackedTargetPageOptions {
  type: string;
  content: string;
  fieldsJson: string | null;
  siteName: string;
  primaryColor: string;
  shortId: string;
  language: SupportedLanguage;
}

const COPY = {
  en: {
    openLink: "Open link",
    scanTarget: "Tracked QR destination",
    rawPayload: "Encoded content",
    actionCall: "Call number",
    actionEmail: "Compose email",
    actionSms: "Send SMS",
    actionMaps: "Open location",
    actionEvent: "Download calendar file",
    actionContact: "Download contact",
    actionWebsite: "Open website",
    footer: "Opened through a statistics-enabled QR code.",
    typeTitle: {
      text: "Text content",
      wifi: "WiFi details",
      phone: "Phone number",
      email: "Email draft",
      sms: "SMS draft",
      geo: "Location details",
      event: "Event details",
      vcard: "Contact details",
      fallback: "QR code destination",
    },
    typeDescription: {
      text: "This QR code opens a text target instead of embedding the content directly.",
      wifi: "Use these network details to connect manually on your device.",
      phone: "Review the number before starting the call.",
      email: "Check the recipient and message before opening your mail app.",
      sms: "Review the recipient and message before opening your SMS app.",
      geo: "This QR code points to a location target page with the saved place details.",
      event: "This QR code opens an event landing page with the appointment information.",
      vcard: "This QR code opens a contact landing page with the stored details.",
      fallback: "This QR code opens a tracked target page with the saved content.",
    },
    fieldLabels: {
      "url.url": "URL",
      "text.content": "Text",
      "wifi.ssid": "Network name",
      "wifi.password": "Password",
      "wifi.encryption": "Encryption",
      "wifi.hidden": "Hidden network",
      "phone.number": "Phone number",
      "email.to": "Email address",
      "email.subject": "Subject",
      "email.body": "Message",
      "sms.number": "Phone number",
      "sms.message": "Message",
      "geo.query": "Search query",
      "geo.latitude": "Latitude",
      "geo.longitude": "Longitude",
      "event.title": "Title",
      "event.location": "Location",
      "event.startDate": "Start",
      "event.endDate": "End",
      "event.description": "Description",
      "vcard.firstName": "First name",
      "vcard.lastName": "Last name",
      "vcard.phone": "Phone",
      "vcard.email": "Email",
      "vcard.organization": "Organization",
      "vcard.url": "Website",
      "vcard.address": "Address",
    },
  },
  de: {
    openLink: "Link öffnen",
    scanTarget: "Ziel des getrackten QR-Codes",
    rawPayload: "Kodierter Inhalt",
    actionCall: "Nummer anrufen",
    actionEmail: "E-Mail verfassen",
    actionSms: "SMS senden",
    actionMaps: "Standort öffnen",
    actionEvent: "Kalenderdatei herunterladen",
    actionContact: "Kontakt herunterladen",
    actionWebsite: "Website öffnen",
    footer: "Geöffnet über einen QR-Code mit Statistik.",
    typeTitle: {
      text: "Textinhalt",
      wifi: "WLAN-Daten",
      phone: "Telefonnummer",
      email: "E-Mail-Entwurf",
      sms: "SMS-Entwurf",
      geo: "Standortdaten",
      event: "Termindetails",
      vcard: "Kontaktdaten",
      fallback: "QR-Code-Ziel",
    },
    typeDescription: {
      text: "Dieser QR-Code öffnet eine Text-Zielseite, statt den Inhalt direkt einzubetten.",
      wifi: "Nutze diese Netzwerkdaten, um dich manuell auf deinem Gerät zu verbinden.",
      phone: "Prüfe die Nummer, bevor du den Anruf startest.",
      email: "Prüfe Empfänger und Nachricht, bevor deine Mail-App geöffnet wird.",
      sms: "Prüfe Empfänger und Nachricht, bevor deine SMS-App geöffnet wird.",
      geo: "Dieser QR-Code öffnet eine Zielseite mit den gespeicherten Standortdaten.",
      event: "Dieser QR-Code öffnet eine Terminseite mit allen gespeicherten Informationen.",
      vcard: "Dieser QR-Code öffnet eine Kontaktseite mit den gespeicherten Daten.",
      fallback: "Dieser QR-Code öffnet eine getrackte Zielseite mit dem gespeicherten Inhalt.",
    },
    fieldLabels: {
      "url.url": "URL",
      "text.content": "Text",
      "wifi.ssid": "Netzwerkname",
      "wifi.password": "Passwort",
      "wifi.encryption": "Verschlüsselung",
      "wifi.hidden": "Verstecktes Netzwerk",
      "phone.number": "Telefonnummer",
      "email.to": "E-Mail-Adresse",
      "email.subject": "Betreff",
      "email.body": "Nachricht",
      "sms.number": "Telefonnummer",
      "sms.message": "Nachricht",
      "geo.query": "Suchanfrage",
      "geo.latitude": "Breitengrad",
      "geo.longitude": "Längengrad",
      "event.title": "Titel",
      "event.location": "Ort",
      "event.startDate": "Beginn",
      "event.endDate": "Ende",
      "event.description": "Beschreibung",
      "vcard.firstName": "Vorname",
      "vcard.lastName": "Nachname",
      "vcard.phone": "Telefon",
      "vcard.email": "E-Mail",
      "vcard.organization": "Organisation",
      "vcard.url": "Website",
      "vcard.address": "Adresse",
    },
  },
} as const;

export function detectTargetPageLanguage(request: Request): SupportedLanguage {
  const acceptLanguage = request.headers.get("accept-language") || "";
  return acceptLanguage.toLowerCase().startsWith("de") ? "de" : "en";
}

export function renderTrackedTargetPage({
  type,
  content,
  fieldsJson,
  siteName,
  primaryColor,
  shortId,
  language,
}: RenderTrackedTargetPageOptions): string {
  const copy = COPY[language];
  const fields = parseStoredQRFields(type, fieldsJson);
  const values = fields
    ? getQRTargetDisplayItems(
        fields,
        language === "de" ? "Ja" : "Yes",
        language === "de" ? "Nein" : "No"
      )
    : getFallbackTargetDisplayItems(type, content);
  const actions = fields ? getActions(fields, copy) : [];
  const title = getPageTitle(type, fields, copy);
  const description =
    copy.typeDescription[type as keyof typeof copy.typeDescription] ||
    copy.typeDescription.fallback;

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(title)} · ${escapeHtml(siteName)}</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:linear-gradient(135deg,#f7f7f2 0%,#ece8de 100%);color:#111827;min-height:100vh}
    .shell{max-width:960px;margin:0 auto;padding:32px 18px 48px}
    .hero{position:relative;overflow:hidden;border:1px solid rgba(17,24,39,.08);border-radius:28px;padding:28px;background:rgba(255,255,255,.82);backdrop-filter:blur(18px);box-shadow:0 24px 70px rgba(17,24,39,.08)}
    .hero:before{content:"";position:absolute;inset:auto -80px -120px auto;width:280px;height:280px;border-radius:999px;background:${escapeHtml(primaryColor)}22;filter:blur(4px)}
    .eyebrow{display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(17,24,39,.06);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#374151}
    h1{margin:18px 0 10px;font-size:clamp(1.9rem,3vw,3.2rem);line-height:1.04;letter-spacing:-.04em;max-width:12ch}
    .lead{max-width:62ch;font-size:1rem;line-height:1.7;color:#4b5563}
    .grid{display:grid;grid-template-columns:1.4fr .9fr;gap:18px;margin-top:20px}
    .panel{border:1px solid rgba(17,24,39,.08);border-radius:24px;padding:22px;background:rgba(255,255,255,.88)}
    .section-title{margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280}
    .value-list{display:grid;gap:12px}
    .value-row{display:grid;gap:4px;padding:14px 16px;border-radius:18px;background:#f9fafb;border:1px solid rgba(17,24,39,.05)}
    .value-label{font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#6b7280}
    .value-text{font-size:15px;line-height:1.6;color:#111827;word-break:break-word;white-space:pre-wrap}
    .value-link{color:#111827;text-decoration:none;border-bottom:1px solid rgba(17,24,39,.22)}
    .value-link:hover{border-bottom-color:${escapeHtml(primaryColor)}}
    .actions{display:grid;gap:12px}
    .action{display:flex;align-items:center;justify-content:center;min-height:48px;padding:0 16px;border-radius:16px;background:${escapeHtml(primaryColor)};color:#fff;text-decoration:none;font-weight:700;box-shadow:0 12px 30px ${escapeHtml(primaryColor)}33}
    .action.secondary{background:#fff;color:#111827;border:1px solid rgba(17,24,39,.1);box-shadow:none}
    .meta{margin-top:14px;font-size:13px;line-height:1.6;color:#6b7280}
    .foot{margin-top:18px;font-size:12px;color:#6b7280}
    @media (max-width: 820px){.grid{grid-template-columns:1fr}h1{max-width:none}}
    @media (prefers-color-scheme: dark){
      body{background:linear-gradient(135deg,#111827 0%,#0f172a 100%);color:#f9fafb}
      .hero,.panel{background:rgba(17,24,39,.78);border-color:rgba(255,255,255,.08);box-shadow:none}
      .eyebrow{background:rgba(255,255,255,.08);color:#d1d5db}
      .lead,.meta,.foot,.value-label{color:#9ca3af}
      .value-row{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.06)}
      .value-text,.value-link{color:#f9fafb}
      .action.secondary{background:rgba(255,255,255,.06);color:#f9fafb;border-color:rgba(255,255,255,.08)}
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div class="eyebrow">${escapeHtml(copy.scanTarget)} · /s/${escapeHtml(shortId)}</div>
      <h1>${escapeHtml(title)}</h1>
      <p class="lead">${escapeHtml(description)}</p>
      <div class="grid">
        <section class="panel">
          <h2 class="section-title">${escapeHtml(copy.scanTarget)}</h2>
          <div class="value-list">
            ${values
              .map(
                (item) => `<div class="value-row">
                <div class="value-label">${escapeHtml(getFieldLabel(copy, item.labelKey))}</div>
                <div class="value-text">${
                  item.href
                    ? `<a class="value-link" href="${escapeHtml(item.href)}">${escapeHtml(item.value)}</a>`
                    : escapeHtml(item.value)
                }</div>
              </div>`
              )
              .join("")}
          </div>
        </section>
        <aside class="panel">
          <h2 class="section-title">${escapeHtml(copy.openLink)}</h2>
          <div class="actions">
            ${actions.length
              ? actions
                  .map(
                    (action, index) => `<a class="action${index > 0 ? " secondary" : ""}" href="${escapeHtml(action.href)}"${
                      action.downloadName
                        ? ` download="${escapeHtml(action.downloadName)}"`
                        : ""
                    }>${escapeHtml(action.label)}</a>`
                  )
                  .join("")
              : `<div class="meta">${escapeHtml(copy.footer)}</div>`}
          </div>
          <p class="meta">${escapeHtml(copy.rawPayload)}:</p>
          <div class="value-row">
            <div class="value-text">${escapeHtml(content)}</div>
          </div>
          <p class="foot">${escapeHtml(siteName)} · ${escapeHtml(copy.footer)}</p>
        </aside>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function getPageTitle(
  type: string,
  fields: QRFields | null,
  copy: (typeof COPY)[SupportedLanguage]
): string {
  if (fields) {
    switch (fields.type) {
      case "text":
        return excerpt(fields.content) || copy.typeTitle.text;
      case "wifi":
        return fields.ssid || copy.typeTitle.wifi;
      case "phone":
        return fields.number || copy.typeTitle.phone;
      case "email":
        return fields.to || copy.typeTitle.email;
      case "sms":
        return fields.number || copy.typeTitle.sms;
      case "geo": {
        const coordinates = [fields.latitude, fields.longitude]
          .filter((value) => value.trim().length > 0)
          .join(", ");
        return fields.query || coordinates || copy.typeTitle.geo;
      }
      case "event":
        return fields.title || copy.typeTitle.event;
      case "vcard": {
        const fullName = `${fields.firstName} ${fields.lastName}`.trim();
        return fullName || fields.organization || copy.typeTitle.vcard;
      }
      default:
        return copy.typeTitle.fallback;
    }
  }

  return copy.typeTitle[type as keyof typeof copy.typeTitle] || copy.typeTitle.fallback;
}

function getFieldLabel(
  copy: (typeof COPY)[SupportedLanguage],
  labelKey: string
): string {
  return copy.fieldLabels[labelKey as keyof typeof copy.fieldLabels] || labelKey;
}

function getActions(
  fields: QRFields,
  copy: (typeof COPY)[SupportedLanguage]
): Array<{ label: string; href: string; downloadName?: string }> {
  switch (fields.type) {
    case "phone":
      return [{ label: copy.actionCall, href: buildPayload(fields) }];
    case "email":
      return [{ label: copy.actionEmail, href: buildPayload(fields) }];
    case "sms":
      return [{ label: copy.actionSms, href: buildPayload(fields) }];
    case "geo":
      return [{ label: copy.actionMaps, href: getMapHref(fields) }];
    case "event":
      return [
        {
          label: copy.actionEvent,
          href: buildDataUri("text/calendar", buildPayload(fields)),
          downloadName: "event.ics",
        },
      ];
    case "vcard": {
      const actions: Array<{ label: string; href: string; downloadName?: string }> = [
        {
          label: copy.actionContact,
          href: buildDataUri("text/vcard", buildPayload(fields)),
          downloadName: "contact.vcf",
        },
      ];
      if (fields.url) {
        actions.push({ label: copy.actionWebsite, href: fields.url });
      }
      return actions;
    }
    default:
      return [];
  }
}

function getMapHref(fields: Extract<QRFields, { type: "geo" }>): string {
  if (fields.query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fields.query)}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${fields.latitude},${fields.longitude}`)}`;
}

function buildDataUri(mimeType: string, content: string): string {
  return `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
}

function excerpt(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 64) {
    return normalized;
  }

  return `${normalized.slice(0, 61)}...`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}