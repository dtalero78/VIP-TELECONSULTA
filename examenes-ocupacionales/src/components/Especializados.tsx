import {
  ForkKnifeIcon,
  PersonSimpleWalkIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

const grupos = [
  {
    icon: ForkKnifeIcon,
    title: "Manipulación de alimentos",
    intro:
      "Certifica que el personal cumple las condiciones sanitarias para manipular alimentos.",
    items: [
      "Examen médico con énfasis osteomuscular",
      "KOH: cultivo cutáneo en piel o uñas",
      "Coprológico: búsqueda de parásitos intestinales",
      "Frotis faríngeo: infecciones en la garganta",
      "Examen de orina: infecciones, sangre y glucosa",
      "Serología: detección de sífilis",
    ],
  },
  {
    icon: PersonSimpleWalkIcon,
    title: "Trabajo en altura",
    intro:
      "Según la Resolución 1178 de 2017, aplica a toda labor con riesgo de caída a 1,50 m o más sobre un nivel inferior.",
    items: [
      "Examen médico con énfasis en altura y equilibrio",
      "Optometría y visiometría",
      "Audiometría",
      "Electrocardiograma",
      "Laboratorio: perfil lipídico, glicemia y cuadro hemático",
    ],
  },
];

export function Especializados() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Exámenes especializados según el riesgo del cargo
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Para cargos con exigencias específicas armamos el perfil de pruebas
            que exige la normatividad colombiana.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {grupos.map((g, i) => {
            const Icon = g.icon;
            return (
              <Reveal
                key={g.title}
                delay={i * 0.08}
                as="article"
                className="card p-8 sm:p-9"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                  <Icon weight="duotone" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-fg">
                  {g.title}
                </h3>
                <p className="mt-3 max-w-prose leading-relaxed text-muted">
                  {g.intro}
                </p>
                <ul className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border">
                  {g.items.map((it) => (
                    <li
                      key={it}
                      className="flex items-center gap-3 bg-surface px-4 py-3 text-sm text-fg"
                    >
                      <CheckIcon
                        weight="bold"
                        className="h-4 w-4 shrink-0 text-accent"
                      />
                      {it}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
