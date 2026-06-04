import Image from "next/image";
import {
  SealCheckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { img, photos } from "@/lib/site";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section id="inicio" className="px-4 pt-8 sm:px-6 lg:pt-12">
      <div className="mx-auto max-w-7xl">
        <Reveal className="relative">
          {/* Imagen ancha */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2 sm:aspect-[16/9] lg:aspect-[21/9]">
            <Image
              src={img(photos.diagnostico, 1920, 820)}
              alt="Profesionales de la salud revisando imágenes diagnósticas en la IPS"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#04140f]/40 to-transparent lg:from-[#04140f]/20" />
          </div>

          {/* Tarjeta sobrepuesta (card-over-image) */}
          <div className="float-card relative mx-3 -mt-20 max-w-xl p-7 sm:mx-6 sm:p-9 lg:absolute lg:bottom-9 lg:left-9 lg:mx-0 lg:mt-0">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-strong">
              <ShieldCheckIcon weight="fill" className="h-3.5 w-3.5" />
              Telemedicina habilitada por el Ministerio de Salud
            </p>
            <h1 className="mt-4 text-3xl font-medium leading-[1.08] tracking-tight text-fg sm:text-4xl lg:text-[2.85rem]">
              Exámenes médicos ocupacionales online
            </h1>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              Realiza tu valoración médica laboral por videollamada, desde donde
              estés. Te entregamos el certificado de aptitud en digital apenas
              terminas.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-all hover:bg-accent-strong active:scale-[0.98]"
              >
                Quiero el examen virtual
                <ArrowRightIcon weight="bold" className="h-4 w-4" />
              </a>
              <a
                href="#solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong px-6 py-3 text-sm font-semibold text-fg transition-all hover:border-accent hover:text-accent-strong active:scale-[0.98]"
              >
                Soy empresa
              </a>
            </div>
            <div className="mt-6 flex items-center gap-2.5 border-t border-border pt-4">
              <SealCheckIcon
                weight="fill"
                className="h-5 w-5 shrink-0"
                style={{ color: "var(--teal)" }}
              />
              <span className="text-sm font-medium text-muted">
                Certificado digital el mismo día · atención por videollamada
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
