import type { QRFields, QRType } from "@/types/qr";

export interface QRTargetDisplayItem {
  labelKey: string;
  value: string;
  href?: string;
  multiline?: boolean;
}

const KNOWN_QR_TYPES = new Set<QRType>([
  "url",
  "text",
  "wifi",
  "phone",
  "email",
  "sms",
  "geo",
  "event",
  "vcard",
]);

export function isTrackedTargetPageType(type: string): boolean {
  return type !== "url";
}

export function parseStoredQRFields(
  type: string,
  fieldsJson: string | null
): QRFields | null {
  if (!fieldsJson || !KNOWN_QR_TYPES.has(type as QRType)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fieldsJson) as Partial<QRFields> | null;
    if (!parsed || typeof parsed !== "object" || parsed.type !== type) {
      return null;
    }

    return parsed as QRFields;
  } catch {
    return null;
  }
}

export function getQRTargetDisplayItems(
  fields: QRFields,
  yesLabel = "Yes",
  noLabel = "No"
): QRTargetDisplayItem[] {
  switch (fields.type) {
    case "url":
      return [{ labelKey: "url.url", value: fields.url, href: fields.url }];

    case "text":
      return [
        { labelKey: "text.content", value: fields.content, multiline: true },
      ];

    case "wifi":
      return compactItems([
        { labelKey: "wifi.ssid", value: fields.ssid },
        { labelKey: "wifi.password", value: fields.password },
        { labelKey: "wifi.encryption", value: fields.encryption },
        { labelKey: "wifi.hidden", value: fields.hidden ? yesLabel : noLabel },
      ]);

    case "phone":
      return compactItems([
        {
          labelKey: "phone.number",
          value: fields.number,
          href: `tel:${fields.number}`,
        },
      ]);

    case "email":
      return compactItems([
        {
          labelKey: "email.to",
          value: fields.to,
          href: `mailto:${fields.to}`,
        },
        { labelKey: "email.subject", value: fields.subject },
        { labelKey: "email.body", value: fields.body, multiline: true },
      ]);

    case "sms":
      return compactItems([
        {
          labelKey: "sms.number",
          value: fields.number,
          href: `tel:${fields.number}`,
        },
        { labelKey: "sms.message", value: fields.message, multiline: true },
      ]);

    case "geo":
      return compactItems([
        { labelKey: "geo.query", value: fields.query },
        { labelKey: "geo.latitude", value: fields.latitude },
        { labelKey: "geo.longitude", value: fields.longitude },
      ]);

    case "event":
      return compactItems([
        { labelKey: "event.title", value: fields.title },
        { labelKey: "event.location", value: fields.location },
        { labelKey: "event.startDate", value: formatDateTimeValue(fields.startDate) },
        { labelKey: "event.endDate", value: formatDateTimeValue(fields.endDate) },
        {
          labelKey: "event.description",
          value: fields.description,
          multiline: true,
        },
      ]);

    case "vcard":
      return compactItems([
        { labelKey: "vcard.firstName", value: fields.firstName },
        { labelKey: "vcard.lastName", value: fields.lastName },
        {
          labelKey: "vcard.phone",
          value: fields.phone,
          href: `tel:${fields.phone}`,
        },
        {
          labelKey: "vcard.email",
          value: fields.email,
          href: `mailto:${fields.email}`,
        },
        { labelKey: "vcard.organization", value: fields.organization },
        { labelKey: "vcard.url", value: fields.url, href: fields.url },
        {
          labelKey: "vcard.address",
          value: fields.address,
          multiline: true,
        },
      ]);

    default: {
      const _exhaustive: never = fields;
      return _exhaustive;
    }
  }
}

export function getFallbackTargetDisplayItems(
  type: string,
  content: string
): QRTargetDisplayItem[] {
  return [
    {
      labelKey: type === "url" ? "url.url" : "text.content",
      value: content,
      multiline: true,
    },
  ];
}

function compactItems(items: QRTargetDisplayItem[]): QRTargetDisplayItem[] {
  return items.filter((item) => item.value.trim().length > 0);
}

function formatDateTimeValue(value: string): string {
  return value.replace("T", " ").trim();
}