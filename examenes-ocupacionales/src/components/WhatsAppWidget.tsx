"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  WhatsappLogoIcon,
  XIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { contactChannels } from "@/lib/contact";
import Link from "next/link";
const menuVersions = [
  {
    title: "¿Cómo podemos ayudarte?",
    questions: {
      Telemedicina: "¿Quieres información sobre tu examen virtual?",
      Comercial: "¿Necesitas cotizar para tu empresa?",
      "Servicio al cliente": "¿Necesitas ayuda con una solicitud?",
    },
    start: "¿Listo para iniciar tu examen virtual?",
  },
  {
    title: "¿Qué necesitas hoy?",
    questions: {
      Telemedicina: "¿Tienes dudas sobre la atención por videollamada?",
      Comercial: "¿Buscas exámenes para tu equipo de trabajo?",
      "Servicio al cliente": "¿Quieres consultar el estado de tu atención?",
    },
    start: "¿Quieres comenzar tu solicitud en línea?",
  },
  {
    title: "¿En qué te orientamos?",
    questions: {
      Telemedicina: "¿Quieres saber cómo agendar tu examen virtual?",
      Comercial: "¿Te gustaría recibir una cotización empresarial?",
      "Servicio al cliente": "¿Necesitas resolver una inquietud de tu atención?",
    },
    start: "¿Empezamos tu solicitud de examen?",
  },
] as const;
const messages = [
  {
    title: "¿Necesita información?",
    text: "Estamos disponibles para orientarle.",
  },
  {
    title: "¿Desea agendar su examen?",
    text: "Le ayudamos a iniciar su solicitud.",
  },
  {
    title: "Atención para su empresa",
    text: "Conversemos sobre los servicios que necesita.",
  },
  {
    title: "¿Necesita ayuda con su certificado?",
    text: "Consulte las opciones de atención VIP.",
  },
  {
    title: "Su examen, paso a paso",
    text: "Resuelva sus dudas con nuestro equipo.",
  },
];
export function WhatsAppWidget() {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(0),
    [typing, setTyping] = useState(false),
    [hidden, setHidden] = useState(false);
  const [menuVersion, setMenuVersion] = useState<number | null>(null);
  const menuCopy = menuVersions[menuVersion ?? 0];
  const path = usePathname();
  const trigger = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open)
      panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [open]);
  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(() => {
    if (open || hidden || path.startsWith("/examenes-virtuales")) return;
    const timer = setTimeout(() => {
      if (typing) setMessage((i) => (i + 1) % messages.length);
      setTyping(!typing);
    }, typing ? 5000 : 10000);
    return () => clearTimeout(timer);
  }, [open, hidden, typing, path]);
  const openMenu = () => {
    // Sorteo por apertura; evita repetir inmediatamente la versión anterior.
    const choices = menuVersions.map((_, i) => i).filter(i => i !== menuVersion);
    setMenuVersion(choices[Math.floor(Math.random() * choices.length)]);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  // Form routes have contextual help in the header, leaving the mobile keyboard and actions clear.
  if (path.startsWith("/examenes-virtuales")) return null;
  return (
    <aside
      className="whatsapp-widget"
      aria-label="Ayuda de VIP"
    >
      {open && (
        <div
          id="vip-contact-menu"
          ref={panel}
          className="contact-panel"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="eyebrow">Estamos para ayudarte</p>
              <h2 className="text-base font-semibold mt-2">
                {menuCopy.title}
              </h2>
            </div>
            <button
              aria-label="Cerrar opciones de contacto"
              className="icon-button"
              onClick={close}
            >
              <XIcon size={20} />
            </button>
          </div>
          <p className="text-xs text-muted mt-2 mb-4">
            Elige tu pregunta y abre el canal indicado.
          </p>
          <div className="grid gap-2">
            {contactChannels.map((channel) => (
              <a
                key={channel.phone}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`contact-option ${channel.primary ? "contact-option-primary" : ""}`}
              >
                <span className="min-w-0"><span className="block">{menuCopy.questions[channel.label]}</span><span className="block text-[11px] mt-2 font-normal">{channel.label}{channel.primary ? " (principal)" : ""} · {channel.phone}</span></span>
                <ArrowUpRightIcon size={18} className="shrink-0 ml-2" />
              </a>
            ))}
            <Link
              href="/examenes-virtuales"
              onClick={() => setOpen(false)}
              className="contact-option text-accent-strong"
            >
              {menuCopy.start} <span aria-hidden className="shrink-0 ml-2">→</span>
            </Link>
          </div>
        </div>
      )}
      <div className="whatsapp-launcher">
        {!open && (
          <button
            type="button"
            className="whatsapp-bubble"
            data-typing={typing}
            onClick={openMenu}
            aria-label="Ver opciones de atención VIP"
          >
            <span className="whatsapp-bubble-label">WHATSAPP VIP</span>
            <span className="whatsapp-conversation" aria-live="off">
              <span className="whatsapp-bubble-copy" aria-hidden={typing}>
                <strong>{messages[message].title}</strong>
                <span>{messages[message].text}</span>
              </span>
              <span className="whatsapp-typing" aria-hidden={!typing}>
                <span className="sr-only">Preparando el siguiente mensaje</span>
                <span className="whatsapp-typing-dots" aria-hidden="true">
                  <span /><span /><span />
                </span>
              </span>
            </span>
          </button>
        )}
        <button
          type="button"
          ref={trigger}
          className="whatsapp-trigger"
          aria-expanded={open}
          aria-controls="vip-contact-menu"
          aria-label={
            open ? "Cerrar ayuda" : "Abrir opciones de WhatsApp y atención VIP"
          }
          onClick={() => (open ? close() : openMenu())}
        >
          <WhatsappLogoIcon size={38} weight="regular" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
