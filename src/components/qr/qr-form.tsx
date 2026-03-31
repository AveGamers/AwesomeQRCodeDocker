"use client";

import { useTranslations } from "next-intl";
import type { QRType, QRFields } from "@/types/qr";

interface Props {
  type: QRType;
  fields: Record<string, string | boolean>;
  onChange: (fields: Record<string, string | boolean>) => void;
}

export function QRForm({ type, fields, onChange }: Props) {
  const t = useTranslations("generator.fields");

  function set(key: string, value: string | boolean) {
    onChange({ ...fields, [key]: value });
  }

  const inputCls =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "block text-sm font-medium mb-1";

  switch (type) {
    case "url":
      return (
        <div>
          <label className={labelCls}>{t("url.url")}</label>
          <input
            type="url"
            className={inputCls}
            placeholder={t("url.urlPlaceholder")}
            value={(fields.url as string) || ""}
            onChange={(e) => set("url", e.target.value)}
          />
        </div>
      );

    case "text":
      return (
        <div>
          <label className={labelCls}>{t("text.content")}</label>
          <textarea
            className={`${inputCls} min-h-[100px] resize-y`}
            placeholder={t("text.contentPlaceholder")}
            value={(fields.content as string) || ""}
            onChange={(e) => set("content", e.target.value)}
            maxLength={2953}
          />
        </div>
      );

    case "wifi":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>{t("wifi.ssid")}</label>
            <input
              className={inputCls}
              value={(fields.ssid as string) || ""}
              onChange={(e) => set("ssid", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("wifi.password")}</label>
            <input
              type="password"
              className={inputCls}
              value={(fields.password as string) || ""}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("wifi.encryption")}</label>
            <select
              className={inputCls}
              value={(fields.encryption as string) || "WPA"}
              onChange={(e) => set("encryption", e.target.value)}
            >
              <option value="WPA">{t("wifi.wpa")}</option>
              <option value="WEP">{t("wifi.wep")}</option>
              <option value="nopass">{t("wifi.none")}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!fields.hidden}
              onChange={(e) => set("hidden", e.target.checked)}
              className="rounded border-input"
            />
            {t("wifi.hidden")}
          </label>
        </div>
      );

    case "phone":
      return (
        <div>
          <label className={labelCls}>{t("phone.number")}</label>
          <input
            type="tel"
            className={inputCls}
            placeholder={t("phone.numberPlaceholder")}
            value={(fields.number as string) || ""}
            onChange={(e) => set("number", e.target.value)}
          />
        </div>
      );

    case "email":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>{t("email.to")}</label>
            <input
              type="email"
              className={inputCls}
              placeholder={t("email.toPlaceholder")}
              value={(fields.to as string) || ""}
              onChange={(e) => set("to", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("email.subject")}</label>
            <input
              className={inputCls}
              value={(fields.subject as string) || ""}
              onChange={(e) => set("subject", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("email.body")}</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={(fields.body as string) || ""}
              onChange={(e) => set("body", e.target.value)}
            />
          </div>
        </div>
      );

    case "sms":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>{t("sms.number")}</label>
            <input
              type="tel"
              className={inputCls}
              placeholder={t("sms.numberPlaceholder")}
              value={(fields.number as string) || ""}
              onChange={(e) => set("number", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("sms.message")}</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={(fields.message as string) || ""}
              onChange={(e) => set("message", e.target.value)}
            />
          </div>
        </div>
      );

    case "geo":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t("geo.latitude")}</label>
              <input
                type="number"
                step="any"
                className={inputCls}
                value={(fields.latitude as string) || ""}
                onChange={(e) => set("latitude", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t("geo.longitude")}</label>
              <input
                type="number"
                step="any"
                className={inputCls}
                value={(fields.longitude as string) || ""}
                onChange={(e) => set("longitude", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("geo.query")}</label>
            <input
              className={inputCls}
              value={(fields.query as string) || ""}
              onChange={(e) => set("query", e.target.value)}
            />
          </div>
        </div>
      );

    case "event":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>{t("event.title")}</label>
            <input
              className={inputCls}
              value={(fields.title as string) || ""}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("event.location")}</label>
            <input
              className={inputCls}
              value={(fields.location as string) || ""}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t("event.startDate")}</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={(fields.startDate as string) || ""}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t("event.endDate")}</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={(fields.endDate as string) || ""}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("event.description")}</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={(fields.description as string) || ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>
      );

    case "vcard":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t("vcard.firstName")}</label>
              <input
                className={inputCls}
                value={(fields.firstName as string) || ""}
                onChange={(e) => set("firstName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t("vcard.lastName")}</label>
              <input
                className={inputCls}
                value={(fields.lastName as string) || ""}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("vcard.phone")}</label>
            <input
              type="tel"
              className={inputCls}
              value={(fields.phone as string) || ""}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("vcard.email")}</label>
            <input
              type="email"
              className={inputCls}
              value={(fields.email as string) || ""}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("vcard.organization")}</label>
            <input
              className={inputCls}
              value={(fields.organization as string) || ""}
              onChange={(e) => set("organization", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("vcard.url")}</label>
            <input
              type="url"
              className={inputCls}
              value={(fields.url as string) || ""}
              onChange={(e) => set("url", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t("vcard.address")}</label>
            <input
              className={inputCls}
              value={(fields.address as string) || ""}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
        </div>
      );
  }
}

/** Map flat form fields to typed QR fields for payload generation. */
export function toQRFields(
  type: QRType,
  raw: Record<string, string | boolean>
): QRFields {
  switch (type) {
    case "url":
      return { type: "url", url: String(raw.url || "") };
    case "text":
      return { type: "text", content: String(raw.content || "") };
    case "wifi":
      return {
        type: "wifi",
        ssid: String(raw.ssid || ""),
        password: String(raw.password || ""),
        encryption: (raw.encryption as "WPA" | "WEP" | "nopass") || "WPA",
        hidden: !!raw.hidden,
      };
    case "phone":
      return { type: "phone", number: String(raw.number || "") };
    case "email":
      return {
        type: "email",
        to: String(raw.to || ""),
        subject: String(raw.subject || ""),
        body: String(raw.body || ""),
      };
    case "sms":
      return {
        type: "sms",
        number: String(raw.number || ""),
        message: String(raw.message || ""),
      };
    case "geo":
      return {
        type: "geo",
        latitude: String(raw.latitude || ""),
        longitude: String(raw.longitude || ""),
        query: String(raw.query || ""),
      };
    case "event":
      return {
        type: "event",
        title: String(raw.title || ""),
        location: String(raw.location || ""),
        startDate: String(raw.startDate || ""),
        endDate: String(raw.endDate || ""),
        description: String(raw.description || ""),
      };
    case "vcard":
      return {
        type: "vcard",
        firstName: String(raw.firstName || ""),
        lastName: String(raw.lastName || ""),
        phone: String(raw.phone || ""),
        email: String(raw.email || ""),
        organization: String(raw.organization || ""),
        url: String(raw.url || ""),
        address: String(raw.address || ""),
      };
  }
}
