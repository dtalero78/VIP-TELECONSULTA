"use client";

import { useState } from "react";
import {
  UserPlusIcon,
  PulseIcon,
  SignOutIcon,
  StethoscopeIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { Reveal } from "./Reveal";

const servicios = [
  {
    tab: "Ingreso",
    icon: UserPlusIcon,
    title: "Examen ocupacional de ingreso",
    desc: "Dictamina las condiciones de salud de un candidato antes de vincularlo a un cargo y define su aptitud para las funciones.",
    points: [
      "Anamnesis y examen físico completo",
      "Concepto de aptitud para el cargo",
      "Recomendaciones para el empleador",
    ],
  },
  {
    tab: "Periódico",
    icon: PulseIcon,
    title: "Examen ocupacional periódico",
    desc: "Monitorea la exposición a los factores de riesgo del cargo durante la relación laboral del trabajador.",
    points: [
      "Seguimiento del estado de salud",
      "Detección temprana de afecciones",
      "Insumo para el sistema de gestión SST",
    ],
  },
  {
    tab: "Retiro",
    icon: SignOutIcon,
    title: "Examen ocupacional de retiro",
    desc: "Emite un concepto de salud cuando el trabajador deja de desempeñar las funciones de su cargo.",
    points: [
      "Valoración final del estado de salud",
      "Soporte documental ante la ARL",
      "Cierre responsable de la relación laboral",
    ],
  },
  {
    tab: "Especializada",
    icon: StethoscopeIcon,
    title: "Medicina laboral especializada",
    desc: "Perfiles específicos según el riesgo del cargo, con las pruebas que exige la normatividad colombiana.",
    points: [
      "Manipulación de alimentos",
      "Trabajo en altura",
      "Pruebas psicológicas y riesgo psicosocial",
    ],
  },
];

export function Servicios() {
  const [active, setActive] = useState(0);
  const current = servicios[active];
  const Icon = current.icon;

  return (
    <section id="servicios" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Un solo aliado para toda la salud ocupacional de tu equipo
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Cubrimos cada etapa de la vida laboral del trabajador, desde la
            vinculación hasta el retiro.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-10">
          <div className="container-box overflow-hidden">
            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Tipos de servicio"
              className="flex gap-2 overflow-x-auto border-b border-border px-4 sm:px-6"
            >
              {servicios.map((s, i) => (
                <button
                  key={s.tab}
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => setActive(i)}
                  className={`shrink-0 border-b-2 px-3 py-4 text-sm font-semibold transition-colors ${
                    active === i
                      ? "border-accent text-accent-strong"
                      : "border-transparent text-muted hover:text-fg"
                  }`}
                >
                  {s.tab}
                </button>
              ))}
            </div>

            {/* Panel */}
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-fg">
                  {current.title}
                </h3>
                <p className="mt-3 max-w-prose leading-relaxed text-muted">
                  {current.desc}
                </p>
                <ul className="mt-6 grid gap-3">
                  {current.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-fg">
                      <CheckIcon
                        weight="bold"
                        className="mt-1 h-4 w-4 shrink-0 text-accent"
                      />
                      <span className="leading-snug">{p}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={active === 0 ? "/examenes-virtuales" : "/empresas"}
                  className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong"
                >
                  {active === 0
                    ? "Solicitar examen de ingreso"
                    : "Consultar este servicio"}
                  <ArrowRightIcon weight="bold" className="h-4 w-4" />
                </a>
              </div>

              {/* Panel visual */}
              <div className="relative hidden overflow-hidden rounded-xl bg-accent-soft lg:block">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-60"
                  style={{
                    background:
                      "radial-gradient(120% 120% at 100% 0%, var(--accent) 0%, transparent 60%)",
                  }}
                />
                <div className="relative grid h-full place-items-center p-10">
                  <Icon
                    weight="duotone"
                    className="h-24 w-24 text-accent-strong"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
