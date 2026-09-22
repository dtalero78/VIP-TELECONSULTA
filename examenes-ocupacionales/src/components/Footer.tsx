import Image from "next/image";
import { company, navLinks } from "@/lib/site";
import { PRIVACY_PATH } from "@/lib/privacy";
import { contactChannels, mapsHref } from "@/lib/contact";

export function Footer() {
  const privacyUrl = process.env.PRIVACY_POLICY_URL || PRIVACY_PATH;
  return (
    <footer className="vip-footer border-t border-white/10 bg-[#0a1626] text-white/70">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="VIP" width={68} height={48} className="h-12 w-17 object-contain" />
              <span className="text-sm font-semibold text-white">VIP Salud Ocupacional</span>
            </div>
            <p className="mt-2 text-xs font-medium text-white/90">Cuidamos tu salud, acompañamos tu trabajo.</p>
            <p className="mt-2 text-xs leading-relaxed text-white/60">NIT {company.nit} · Atención virtual y presencial.</p>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs leading-relaxed hover:text-[#83f3c9]">{company.address} ↗</a>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/90">Atención por WhatsApp</h2>
            <ul className="grid gap-2 text-xs">
              {contactChannels.map(channel => <li key={channel.phone}><a href={channel.href} target="_blank" rel="noopener noreferrer" className={channel.primary ? "footer-channel text-[#83f3c9]" : "footer-channel hover:text-[#83f3c9]"}><span>{channel.label}{channel.primary ? " · Principal" : ""}</span><strong className="font-semibold whitespace-nowrap">{channel.phone} ↗</strong></a></li>)}
            </ul>
          </div>
          <nav aria-label="Enlaces del pie de página" className="flex content-start flex-wrap gap-x-5 gap-y-2 self-start text-xs">
            {navLinks.map(link => <a key={link.href} href={link.href} className="hover:text-[#83f3c9]">{link.label}</a>)}
          </nav>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-[11px] text-white/60">
          <p>© {company.legalName} Todos los derechos reservados.</p>
          <a href={privacyUrl} className="underline underline-offset-4 hover:text-white">Privacidad y tratamiento de datos</a>
        </div>
      </div>
    </footer>
  );
}
