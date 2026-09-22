"use client";

import { useState } from "react";
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
                    id={`faq-question-${i}`}
                    aria-controls={`faq-answer-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-fg">{item.q}</span>
                    <span className="faq-toggle" data-open={isOpen} aria-hidden="true">
                      <span /><span />
                    </span>
                  </button>
                  <div className="faq-answer" data-open={isOpen} id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} aria-hidden={!isOpen}>
                    <div className="min-h-0 overflow-hidden">
                    <p className="px-6 pb-6 leading-relaxed text-muted">
                      {item.a}
                    </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
