"use client";

import { useState } from "react";
import { PlusIcon, MinusIcon } from "@phosphor-icons/react";
import { faqs } from "@/lib/site";
import { Reveal } from "./Reveal";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-32">
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Resolvemos las dudas más comunes sobre el examen médico ocupacional
            virtual.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <ul className="flex flex-col gap-3">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q} className="tile overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-fg">{item.q}</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-strong">
                      {isOpen ? (
                        <MinusIcon weight="bold" className="h-4 w-4" />
                      ) : (
                        <PlusIcon weight="bold" className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="px-6 pb-6 leading-relaxed text-muted">
                      {item.a}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
