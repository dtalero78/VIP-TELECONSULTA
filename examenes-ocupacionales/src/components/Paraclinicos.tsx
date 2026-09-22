import Image from "next/image";
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
    photo: "/images/vip/audiometria.png",
  },
  { icon: EyeIcon, title: "Visiometría", desc: "Tamizaje de la capacidad visual.", photo: "/images/vip/visiometria.png" },
  { icon: EyeglassesIcon, title: "Optometría", desc: "Valoración refractiva y ocular.", photo: "/images/vip/optometria.png" },
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
    photo: "/images/vip/laboratorio.png",
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
                  a.feature ? "sm:col-span-2 sm:grid sm:grid-cols-2 sm:items-center sm:gap-6" : ""
                }`}
              >
                {a.photo && <div className={`relative overflow-hidden rounded-xl mb-5 bg-surface-2 ${a.feature ? "h-64 sm:h-full sm:min-h-64 sm:mb-0" : "h-44"}`}><Image src={a.photo} alt={`${a.title} en la sede VIP Salud Ocupacional`} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className={a.title === "Audiometría" ? "object-contain" : "object-cover"} /></div>}
                <div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                  <Icon weight="duotone" className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-fg">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {a.desc}
                </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
