import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

const tipos = [
  {
    title: "Examen médico preocupacional de ingreso",
    body: "Conoce y dictamina las condiciones de salud en las que se encuentra un candidato a un cargo, antes de su vinculación.",
    points: [
      "Anamnesis y examen físico completo",
      "Concepto de aptitud para el cargo",
      "Recomendaciones para el empleador",
    ],
  },
  {
    title: "Examen médico ocupacional periódico",
    body: "Permite el monitoreo y control de las exposiciones a los factores de riesgo durante el tiempo que el trabajador ocupa el cargo.",
    points: [
      "Seguimiento a la evolución del estado de salud",
      "Detección temprana de afecciones laborales",
      "Insumo para el sistema de gestión SST",
    ],
  },
  {
    title: "Examen médico ocupacional de retiro",
    body: "Emite un concepto de salud sobre el estado en el cual el trabajador deja de desempeñar las funciones de su cargo.",
    points: [
      "Valoración final del estado de salud",
      "Soporte documental ante la ARL",
      "Cierre responsable de la relación laboral",
    ],
  },
];

export function TiposExamen() {
  return (
    <section id="tipos" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-32">
        {/* Aside sticky */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Cada etapa laboral tiene su examen
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Realizamos la valoración que corresponde al momento del trabajador,
            con concepto de aptitud firmado por médicos especialistas en salud
            ocupacional.
          </p>
          <a
            href="/examenes-virtuales"
            className="mt-7 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-all hover:bg-accent-strong active:scale-[0.98]"
          >
            Solicita tus exámenes
          </a>
        </div>

        {/* Tarjetas apiladas */}
        <div className="flex flex-col gap-4">
          {tipos.map((t, i) => (
            <Reveal
              key={t.title}
              delay={i * 0.06}
              as="article"
              className="tile card-hover p-8"
            >
              <h3 className="text-xl font-semibold tracking-tight text-fg">
                {t.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{t.body}</p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
                {t.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-fg">
                    <CheckCircleIcon
                      weight="fill"
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    />
                    <span className="leading-snug">{p}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

