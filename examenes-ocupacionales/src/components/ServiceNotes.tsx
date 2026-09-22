"use client";
import { useEffect, useState } from "react";
import { serviceNotes } from "@/lib/notes";

export function ServiceNotes() {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(() => {
    if (hidden) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % serviceNotes.length), 5000);
    return () => clearTimeout(timer);
  }, [index, hidden]);
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6" aria-label="Información útil" aria-roledescription="carrusel">
      <div className="notes-card notes-compact">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Antes de tu atención</p>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" className="note-arrow" aria-label="Nota anterior" onClick={() => setIndex((i) => (i + serviceNotes.length - 1) % serviceNotes.length)}>←</button>
            <span className="text-xs tabular-nums text-muted">{index + 1} / {serviceNotes.length}</span>
            <button type="button" className="note-arrow" aria-label="Nota siguiente" onClick={() => setIndex((i) => (i + 1) % serviceNotes.length)}>→</button>
          </div>
        </div>
        <div key={index} className="note-content" aria-live="off">
          <h2 className="text-lg font-semibold mt-1">{serviceNotes[index].title}</h2>
          <p className="text-sm text-muted mt-1">{serviceNotes[index].text}</p>
        </div>
      </div>
    </section>
  );
}
