"use client";

import { useTranslations } from "next-intl";
import {
  Link2,
  Type,
  Wifi,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  CalendarDays,
  Contact,
} from "lucide-react";
import { QR_TYPES, type QRType } from "@/types/qr";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<QRType, React.ComponentType<{ className?: string }>> = {
  url: Link2,
  text: Type,
  wifi: Wifi,
  phone: Phone,
  email: Mail,
  sms: MessageSquare,
  geo: MapPin,
  event: CalendarDays,
  vcard: Contact,
};

export function QRTypeSelector({
  value,
  onChange,
}: {
  value: QRType;
  onChange: (t: QRType) => void;
}) {
  const t = useTranslations("generator.type");

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
      {QR_TYPES.map((qrType) => {
        const Icon = TYPE_ICONS[qrType];
        return (
          <button
            key={qrType}
            onClick={() => onChange(qrType)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors",
              value === qrType
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50 hover:bg-accent"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{t(qrType)}</span>
          </button>
        );
      })}
    </div>
  );
}
