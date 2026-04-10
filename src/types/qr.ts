export const QR_TYPES = [
  "url",
  "text",
  "wifi",
  "phone",
  "email",
  "sms",
  "geo",
  "event",
  "vcard",
] as const;

export type QRType = (typeof QR_TYPES)[number];

export interface QRFieldsURL {
  type: "url";
  url: string;
}

export interface QRFieldsText {
  type: "text";
  content: string;
}

export interface QRFieldsWiFi {
  type: "wifi";
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface QRFieldsPhone {
  type: "phone";
  number: string;
}

export interface QRFieldsEmail {
  type: "email";
  to: string;
  subject: string;
  body: string;
}

export interface QRFieldsSMS {
  type: "sms";
  number: string;
  message: string;
}

export interface QRFieldsGeo {
  type: "geo";
  latitude: string;
  longitude: string;
  query: string;
}

export interface QRFieldsEvent {
  type: "event";
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface QRFieldsVCard {
  type: "vcard";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  url: string;
  address: string;
}

export type QRFields =
  | QRFieldsURL
  | QRFieldsText
  | QRFieldsWiFi
  | QRFieldsPhone
  | QRFieldsEmail
  | QRFieldsSMS
  | QRFieldsGeo
  | QRFieldsEvent
  | QRFieldsVCard;

export type DotStyle =
  | "square"
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "extra-rounded";
export type CornerSquareStyle = "square" | "dot" | "extra-rounded";
export type CornerDotStyle = "square" | "dot";
export type GradientType = "linear" | "radial";
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRStyleOptions {
  size: number;
  margin: number;
  embedTargetLabel: boolean;
  errorCorrectionLevel: ErrorCorrectionLevel;
  fgColor: string;
  bgColor: string;
  gradientEnabled: boolean;
  gradientType: GradientType;
  gradientColorEnd: string;
  dotStyle: DotStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  logoDataUrl: string | null;
  logoRatio: number;
}

export const DEFAULT_STYLE: QRStyleOptions = {
  size: 300,
  margin: 10,
  embedTargetLabel: false,
  errorCorrectionLevel: "M",
  fgColor: "#000000",
  bgColor: "#ffffff",
  gradientEnabled: false,
  gradientType: "linear",
  gradientColorEnd: "#4f46e5",
  dotStyle: "square",
  cornerSquareStyle: "square",
  cornerDotStyle: "square",
  logoDataUrl: null,
  logoRatio: 0.2,
};
