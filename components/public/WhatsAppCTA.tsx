import { BUSINESS } from "@/lib/constants";
import { whatsAppLink } from "@/lib/utils/format";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  carTitle?: string;
  message?: string;
  className?: string;
  size?: "default" | "lg";
  label?: string;
}

export function WhatsAppCTA({ carTitle, message, className, size, label }: Props) {
  const text =
    message ??
    (carTitle
      ? `Hallo KSR Auto's, ik heb een vraag over de ${carTitle}. Is deze nog beschikbaar?`
      : "Hallo KSR Auto's, ik heb een vraag.");
  const href = whatsAppLink(text, BUSINESS.whatsapp);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("btn btn-whatsapp", size === "lg" && "btn-lg", "justify-center", className)}
    >
      <MessageCircle className="size-4" aria-hidden />
      {label ?? (carTitle ? "WhatsApp over deze auto" : "WhatsApp ons")}
    </a>
  );
}
