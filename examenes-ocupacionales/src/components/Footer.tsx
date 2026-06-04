import { company, navLinks } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-[#0a1626] text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="VIP Salud Ocupacional"
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg bg-white/95 object-contain p-1"
              />
              <span className="text-[15px] font-semibold tracking-tight text-white">
                VIP Salud Ocupacional
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              {company.legalName} · NIT {company.nit}. Exámenes médicos
              ocupacionales virtuales y presenciales en Colombia.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5 sm:grid-cols-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/65 transition-colors hover:text-[#5eead4]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {company.legalName}. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">
              Política de privacidad
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Política de tratamiento de datos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
