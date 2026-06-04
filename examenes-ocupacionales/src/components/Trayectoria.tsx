import { stats } from "@/lib/site";
import { Reveal } from "./Reveal";

export function Trayectoria() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05} className="bg-surface px-6 py-8">
              <p className="text-3xl font-semibold tracking-tight text-accent-strong sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm leading-snug text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
