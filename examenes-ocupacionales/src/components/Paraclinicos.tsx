import {
  EarIcon,
  EyeIcon,
  EyeglassesIcon,
  WindIcon,
  HeartbeatIcon,
  ScanIcon,
  FlaskIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

const ayudas = [
  {
    icon: EarIcon,
    title: "Audiometría",
    desc: "Evalúa la capacidad auditiva y detecta pérdidas asociadas al ruido laboral.",
    feature: true,
  },
  { icon: EyeIcon, title: "Visiometría", desc: "Tamizaje de la capacidad visual." },
  { icon: EyeglassesIcon, title: "Optometría", desc: "Valoración refractiva y ocular." },
  { icon: WindIcon, title: "Espirometría", desc: "Función pulmonar no invasiva." },
  {
    icon: HeartbeatIcon,
    title: "Electrocardiograma",
    desc: "Registro de la actividad eléctrica del corazón.",
  },
  {
    icon: ScanIcon,
    title: "Imágenes diagnósticas",
    desc: "Rayos X de tórax y de columna dorso-lumbar.",
  },
  {
    icon: FlaskIcon,
    title: "Laboratorio clínico",
    desc: "Pruebas de sangre y orina para el concepto de aptitud.",
  },
];

export function Paraclinicos() {
  return (
    <section id="paraclinicos" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Exámenes paraclínicos para tu certificado de aptitud
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Realizamos en sede las pruebas complementarias necesarias para
            emitir el certificado de aptitud laboral.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ayudas.map((a, i) => {
            const Icon = a.icon;
            return (
              <Reveal
                key={a.title}
                delay={i * 0.05}
                as="article"
                className={`tile card-hover p-7 ${
                  a.feature ? "sm:col-span-2" : ""
                }`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                  <Icon weight="duotone" className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-fg">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {a.desc}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
