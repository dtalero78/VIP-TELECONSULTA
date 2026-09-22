"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { navLinks, REQUEST_HREF, REQUEST_LABEL } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/#inicio" className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="VIP Salud Ocupacional"
            width={92}
            height={60}
            className="h-14 w-20 sm:w-[92px] object-contain"
          />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-fg">
              VIP Salud Ocupacional
            </span>
            <span className="text-[11px] font-medium text-muted">
              Exámenes Médicos Ocupacionales
            </span>
          </span>
        </Link>

        {/* Nav desktop — una sola línea */}
        <nav className="hidden items-center gap-5 xl:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={REQUEST_HREF}
            className="hidden rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-all hover:bg-accent-strong active:scale-[0.98] sm:inline-block"
          >
            {REQUEST_LABEL}
          </a>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-border text-fg xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Drawer móvil */}
      {open && (
        <div className="border-t border-border bg-surface lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-fg transition-colors hover:bg-surface-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href={REQUEST_HREF}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-accent px-5 py-3 text-center text-base font-semibold text-accent-fg"
            >
              {REQUEST_LABEL}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}


