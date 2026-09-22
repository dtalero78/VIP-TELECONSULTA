import Image from "next/image";
import {
  VideoCameraIcon,
  CertificateIcon,
  ScalesIcon,
  ClipboardTextIcon,
} from "@phosphor-icons/react/dist/ssr";
import { coverage } from "@/lib/site";
import { Reveal } from "./Reveal";

const cumplimiento = [
  {
    icon: VideoCameraIcon,
    title: "Telemedicina habilitada (2020)",
    desc: "El examen ocupacional virtual está habilitado desde 2020 por el Ministerio de Salud.",
  },
  {
    icon: ClipboardTextIcon,
    title: "Resolución 1843 de 2005",
    desc: "Regula la práctica de las evaluaciones médicas ocupacionales y permite realizarlas por telemedicina (Art. 8 y 26).",
  },
  {
    icon: CertificateIcon,
    title: "Licencia No. 1100138064 de 2021",
    desc: "Licencia de habilitación en Salud Ocupacional vigente desde 2021.",
  },
  {
    icon: ScalesIcon,
    title: "Resolución 1111 de 2017",
    desc: "Cumplimos los estándares mínimos del Sistema de Gestión de SST del Ministerio del Trabajo.",
  },
];

export function Empresa() {
  return (
    <section id="empresa" className="border-b border-border bg-surface-2">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-strong">
            Nuestra empresa
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Somos una empresa diferente
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Nos gusta entender, analizar y aplicar soluciones que aporten al
            bienestar de cada trabajador. VIP Salud Ocupacional S.A.S. es
            líder en medicina preocupacional y ocupacional en Colombia.
          </p>
        </Reveal>

        {/* Sede + cobertura (bento card-over-image estilo CVS) */}
        <Reveal delay={0.05} className="relative mt-14">
          <div className="container-box overflow-hidden bg-bg p-3 sm:p-4">
            <div className="relative aspect-[680/490] overflow-hidden rounded-xl bg-surface sm:aspect-[16/10]">
              <Image
                src="/images/vip/sede.png"
                alt="Fachada y entrada de la sede de VIP Salud Ocupacional"
                fill
                sizes="(max-width: 1280px) 100vw, 1216px"
                className="object-cover object-top"
              />
            </div>
          </div>
          <div className="float-card relative mx-3 -mt-16 max-w-lg p-7 sm:mx-8 lg:absolute lg:bottom-8 lg:left-8 lg:mx-0 lg:mt-0">
            <h3 className="text-xl font-semibold tracking-tight text-fg">
              Cobertura nacional
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Operamos en las principales ciudades y en más de 60 municipios del
              país.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {coverage.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm font-medium text-fg"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Cumplimiento normativo */}
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cumplimiento.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal
                key={c.title}
                delay={i * 0.06}
                as="article"
                className="card card-hover p-7"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                  <Icon weight="duotone" className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-fg">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {c.desc}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
