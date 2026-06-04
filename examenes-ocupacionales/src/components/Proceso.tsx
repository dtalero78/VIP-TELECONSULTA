import Image from "next/image";
import {
  CalendarCheckIcon,
  IdentificationCardIcon,
  WhatsappLogoIcon,
  PhoneCallIcon,
  SealCheckIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { img, photos } from "@/lib/site";
import { Reveal } from "./Reveal";

const pasos = [
  {
    icon: CalendarCheckIcon,
    title: "Agenda tu cita",
    desc: "Elige el día y la hora que mejor te queden y reserva tu valoración con nosotros.",
  },
  {
    icon: IdentificationCardIcon,
    title: "Valida tus datos",
    desc: "Nos compartes tu número de documento y abrimos tu caso en minutos.",
  },
  {
    icon: WhatsappLogoIcon,
    title: "Llena el formulario",
    desc: "Te llega un formulario breve por WhatsApp; lo completas en pocos minutos.",
  },
  {
    icon: PhoneCallIcon,
    title: "Conéctate a tu cita",
    desc: "Un médico ocupacional te atiende por videollamada y realiza la valoración.",
  },
];

export function Proceso() {
  return (
    <section id="proceso" className="border-b border-border">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-32">
        {/* Imagen telemedicina */}
        <Reveal className="lg:sticky lg:top-24">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Tu examen ocupacional 100% online, paso a paso
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
            Todo desde tu casa o tu oficina. Cuando termina la valoración, te
            entregamos el certificado de aptitud en formato digital.
          </p>
          <a
            href="#solicitar"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-all hover:bg-accent-strong active:scale-[0.98]"
          >
            Quiero el examen virtual
            <ArrowRightIcon weight="bold" className="h-4 w-4" />
          </a>
          <div className="mt-8 hidden overflow-hidden rounded-2xl border border-border bg-surface-2 lg:block">
            <div className="relative aspect-[5/4]">
              <Image
                src={img(photos.telemedicina, 900, 720)}
                alt="Atención médica ocupacional virtual desde un computador"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>

        {/* Pasos verticales */}
        <div>
          <ol className="relative flex flex-col gap-2">
            {pasos.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 0.08} as="li">
                  <div className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-accent-fg shadow-[0_10px_30px_-12px_var(--accent)]">
                        <Icon weight="bold" className="h-7 w-7" />
                      </span>
                      {i < pasos.length - 1 && (
                        <span
                          aria-hidden
                          className="my-1 w-px flex-1 bg-gradient-to-b from-border-strong to-transparent"
                        />
                      )}
                    </div>
                    <div className="pb-10">
                      <span className="font-mono text-xs font-semibold tracking-widest text-accent-strong">
                        0{i + 1}
                      </span>
                      <h3 className="mt-1 text-xl font-semibold tracking-tight text-fg">
                        {p.title}
                      </h3>
                      <p className="mt-2 max-w-sm leading-relaxed text-muted">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ol>

          {/* Resultado final */}
          <Reveal delay={0.1}>
            <div className="flex items-start gap-4 rounded-xl border border-accent/30 bg-accent-soft p-5">
              <SealCheckIcon
                weight="fill"
                className="mt-0.5 h-7 w-7 shrink-0 text-accent-strong"
              />
              <div>
                <p className="font-semibold text-fg">
                  Certificado de aptitud el mismo día
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Al cerrar la consulta te compartimos el enlace para descargar
                  tu certificado de aptitud laboral.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
