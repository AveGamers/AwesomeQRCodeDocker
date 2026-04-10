import type { QRFields } from "@/types/qr";

/**
 * Build the plain-text payload that gets encoded into a QR code.
 * Each type follows the widely-supported format conventions.
 */
export function buildPayload(fields: QRFields): string {
  switch (fields.type) {
    case "url":
      return fields.url;

    case "text":
      return fields.content;

    case "wifi": {
      const hidden = fields.hidden ? "H:true" : "";
      const pass = fields.password
        ? `P:${escapeWifi(fields.password)}`
        : "";
      return `WIFI:T:${fields.encryption};S:${escapeWifi(fields.ssid)};${pass};${hidden};;`;
    }

    case "phone":
      return `tel:${fields.number}`;

    case "email": {
      const params: string[] = [];
      if (fields.subject) params.push(`subject=${encodeURIComponent(fields.subject)}`);
      if (fields.body) params.push(`body=${encodeURIComponent(fields.body)}`);
      const qs = params.length ? `?${params.join("&")}` : "";
      return `mailto:${fields.to}${qs}`;
    }

    case "sms": {
      const body = fields.message
        ? `?body=${encodeURIComponent(fields.message)}`
        : "";
      return `sms:${fields.number}${body}`;
    }

    case "geo": {
      if (fields.query) {
        return `geo:0,0?q=${encodeURIComponent(fields.query)}`;
      }
      return `geo:${fields.latitude},${fields.longitude}`;
    }

    case "event": {
      const dtFmt = (iso: string) =>
        iso.replace(/[-:]/g, "").replace(/\.\d+/, "").split("+")[0] + "Z";

      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${fields.title}`,
        `DTSTART:${dtFmt(fields.startDate)}`,
        `DTEND:${dtFmt(fields.endDate)}`,
      ];
      if (fields.location) lines.push(`LOCATION:${fields.location}`);
      if (fields.description)
        lines.push(`DESCRIPTION:${fields.description}`);
      lines.push("END:VEVENT", "END:VCALENDAR");
      return lines.join("\r\n");
    }

    case "vcard": {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${fields.lastName};${fields.firstName}`,
        `FN:${fields.firstName} ${fields.lastName}`,
      ];
      if (fields.phone) lines.push(`TEL:${fields.phone}`);
      if (fields.email) lines.push(`EMAIL:${fields.email}`);
      if (fields.organization) lines.push(`ORG:${fields.organization}`);
      if (fields.url) lines.push(`URL:${fields.url}`);
      if (fields.address) lines.push(`ADR:;;${fields.address};;;;`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    }

    default: {
      const _exhaustive: never = fields;
      throw new Error(`Unknown QR type: ${(_exhaustive as QRFields).type}`);
    }
  }
}

/** Escape special characters in WiFi SSID / password */
function escapeWifi(val: string): string {
  return val.replace(/([\\;,:"'])/g, "\\$1");
}
