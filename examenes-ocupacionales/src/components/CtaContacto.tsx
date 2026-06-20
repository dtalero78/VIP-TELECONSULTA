import {
  WhatsappLogoIcon,
  PhoneIcon,
  ClockIcon,
  MapPinIcon,
  BuildingsIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import { company } from "@/lib/site";
import { Reveal } from "./Reveal";

const canales = [
  {
    icon: WhatsappLogoIcon,
    label: "WhatsApp",
    value: company.whatsapp,
    href: company.whatsappHref,
  },
  {
    icon: PhoneIcon,
    label: "Teléfono",
    value: company.phone,
    href: company.phoneHref,
  },
];

export function CtaContacto() {
  return (
    <section id="solicitar" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Solicitud */}
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              Empieza tu examen ocupacional virtual hoy
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">
              Escríbenos por WhatsApp y te guiamos paso a paso. Indícanos si lo
              necesitas como empresa o como persona natural, virtual o presencial.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent-strong">
                  <BuildingsIcon weight="duotone" className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold tracking-tight text-fg">
                  Para empresas
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Agilidad y calidad para tus procesos de ingreso, periódicos y
                  retiro a gran escala.
                </p>
              </div>
              <div className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent-strong">
                  <UserIcon weight="duotone" className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold tracking-tight text-fg">
                  Persona natural o ARL
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Obtén tu certificado para afiliación a la ARL por internet o
                  en nuestra sede.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={company.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-accent px-9 py-4.5 text-lg font-semibold text-accent-fg transition-all hover:bg-accent-strong active:scale-[0.98]"
              >
                <WhatsappLogoIcon weight="fill" className="h-6 w-6" />
                Escríbenos por WhatsApp
              </a>
              <a
                href={company.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-7 py-3.5 text-base font-semibold text-fg transition-all hover:border-accent hover:text-accent-strong active:scale-[0.98]"
              >
                <PhoneIcon weight="bold" className="h-5 w-5" />
                Llámanos
              </a>
            </div>
          </Reveal>

          {/* Contacto */}
          <Reveal delay={0.08}>
            <div
              id="contacto"
              className="container-box scroll-mt-24 bg-surface-2 p-8"
            >
              <h3 className="text-xl font-semibold tracking-tight text-fg">
                Canales de comunicación
              </h3>
              <ul className="mt-6 grid gap-3">
                {canales.map((c) => {
                  const Icon = c.icon;
                  return (
                    <li key={c.label}>
                      <a
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          c.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3.5 transition-colors hover:border-accent"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent-strong">
                          <Icon weight="fill" className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-xs font-medium text-muted">
                            {c.label}
                          </span>
                          <span className="font-semibold text-fg">
                            {c.value}
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 grid gap-4 border-t border-border pt-6">
                <div className="flex items-start gap-3">
                  <ClockIcon
                    weight="duotone"
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent-strong"
                  />
                  <p className="text-sm leading-relaxed text-muted">
                    {company.hours}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPinIcon
                    weight="duotone"
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent-strong"
                  />
                  <p className="text-sm leading-relaxed text-muted">
                    {company.address}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
