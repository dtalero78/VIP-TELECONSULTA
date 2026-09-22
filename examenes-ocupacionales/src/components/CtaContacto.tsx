import { WhatsappLogoIcon, PhoneIcon, ClockIcon, MapPinIcon, BuildingsIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";
import { company } from "@/lib/site";
import { Reveal } from "./Reveal";
import { whatsappLinks, contactChannels, mapsHref } from "@/lib/contact";

export function CtaContacto() {
  return (
    <section id="solicitar" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <Reveal className="container-box flex flex-col bg-surface-2 p-6 sm:p-8">
            <p className="eyebrow">Da el siguiente paso</p>
            <h2 className="mt-4 text-balance text-2xl sm:text-3xl font-semibold tracking-tight">Empieza tu examen ocupacional virtual hoy</h2>
            <p className="mt-4 leading-relaxed text-muted">Inicia tu solicitud o cuéntanos qué necesita tu empresa. Te acompañamos durante el proceso.</p>
            <div className="my-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-4">
                <UserIcon className="h-6 w-6 text-accent-strong" weight="duotone" />
                <h3 className="mt-3 font-semibold">Persona natural o ARL</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">Solicita tu valoración y elige los servicios y el horario.</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <BuildingsIcon className="h-6 w-6 text-accent-strong" weight="duotone" />
                <h3 className="mt-3 font-semibold">Para empresas</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">Coordina los exámenes de ingreso, periódicos o de retiro de tu equipo.</p>
              </div>
            </div>
            <div className="mt-auto grid gap-3 sm:grid-cols-2">
              <a href="/examenes-virtuales" className="btn-primary text-sm">Iniciar examen virtual →</a>
              <a href="/empresas" className="btn-secondary text-sm">Cotización empresarial</a>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="container-box flex flex-col bg-surface-2 p-6 sm:p-8">
            <div id="contacto" className="scroll-mt-24 flex h-full flex-col">
              <p className="eyebrow">Conversemos</p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">Canales de comunicación</h2>
              <p className="mt-4 leading-relaxed text-muted">Nuestro equipo te orientará sobre tu solicitud, los servicios y los pasos para tu atención.</p>
              <div className="my-6 grid gap-4">
                <div className="grid gap-2">
                  {contactChannels.map(channel => <a key={channel.phone} href={channel.href} target="_blank" rel="noopener noreferrer" className={`channel-link ${channel.primary ? "channel-primary" : ""}`}><WhatsappLogoIcon size={21} className="shrink-0" /><span className="min-w-0 flex-1"><span className="block text-xs">{channel.label}{channel.primary ? " · Canal principal" : ""}</span><strong className="block text-sm mt-1">{channel.phone}</strong></span><span aria-hidden="true">↗</span></a>)}
                </div>
                <div className="flex items-start gap-3"><ClockIcon className="h-5 w-5 shrink-0 mt-1 text-accent-strong" /><p className="text-sm leading-relaxed text-muted">{company.hours}</p></div>
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-muted hover:text-accent-strong"><MapPinIcon className="h-5 w-5 shrink-0 mt-1 text-accent-strong" /><span className="leading-relaxed">{company.address} ↗</span></a>
              </div>
              <div className="mt-auto grid gap-3 sm:grid-cols-2">
                <a href={whatsappLinks.general} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm"><WhatsappLogoIcon size={19} /> Escríbenos</a>
                <a href={company.phoneHref} className="btn-secondary text-sm"><PhoneIcon size={19} /> Llámanos</a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
