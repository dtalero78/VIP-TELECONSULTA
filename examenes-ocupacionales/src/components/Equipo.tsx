import Image from "next/image";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

const roles = [
  "Médicos especialistas en salud ocupacional",
  "Fonoaudiólogo especialista en salud ocupacional",
  "Optómetra especialista en salud ocupacional",
  "Bacterióloga",
  "Auxiliares de enfermería",
  "Psicología ocupacional",
  "Vacunación",
  "Espirometría",
  "Electrocardiograma",
  "Brigadas extramurales",
];

export function Equipo() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-32">
        {/* Imagen (izquierda en desktop) */}
        <Reveal className="order-last lg:order-first">
          <div className="relative aspect-[680/450] overflow-hidden rounded-2xl border border-border bg-surface-2">
            <Image
              src="/images/vip/equipo.png"
              alt="Equipo de VIP Salud Ocupacional frente a su sede"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* Texto */}
        <Reveal delay={0.08}>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Un equipo de especialistas en medicina laboral
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Cada examen y concepto de aptitud está respaldado por profesionales
            con formación específica en salud ocupacional.
          </p>
          <ul className="mt-8 grid gap-3">
            {roles.map((r) => (
              <li key={r} className="flex items-start gap-3 text-fg">
                <CheckCircleIcon
                  weight="fill"
                  className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                />
                <span className="leading-snug">{r}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
