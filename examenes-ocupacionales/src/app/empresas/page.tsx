import Link from "next/link";
import Image from "next/image";
import { img, photos } from "@/lib/site";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { whatsappLinks } from "@/lib/contact";
export const metadata: Metadata = {
  title: "Atención y cotización para empresas | VIP",
  alternates: { canonical: "/empresas" },
};
export default function Page() {
  return (
    <>
      <Header />
      <main
        id="contenido"
        className="mx-auto max-w-6xl px-5 py-14 sm:py-20 pb-32"
      >
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div>
        <p className="eyebrow">VIP para empresas</p>
        <h1 className="text-4xl sm:text-5xl font-semibold max-w-3xl mt-4">
          La salud de tu equipo,
          <br />
          <span className="text-accent-strong">con atención cercana.</span>
        </h1>
        <p className="text-lg text-muted mt-6 max-w-2xl">
          Cuéntanos qué necesita tu organización. Nuestro equipo te orientará
          sobre servicios, modalidad y cotización.
        </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
          <Image src="/images/vip/recepcion.png" alt="Equipo de recepción orientando a una visitante en VIP Salud Ocupacional" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 mt-10">
          <section className="card p-7 sm:p-9">
            <div className="relative aspect-[16/7] overflow-hidden rounded-xl mb-6">
              <Image src="/images/vip/sala-espera.png" alt="Recepción y sala de espera de la sede VIP" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </div>
            <h2 className="text-2xl font-semibold">Solicitar una cotización</h2>
            <p className="text-muted mt-4">
              Prepara el nombre de tu empresa, la cantidad aproximada de
              personas y las ciudades donde requieres atención. No envíes
              historias clínicas ni documentos de empleados por este canal
              inicial.
            </p>
            <a
              href={whatsappLinks.companies}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-7"
            >
              Cotizar por WhatsApp ↗
            </a>
          </section>
          <section className="card p-7 sm:p-9">
            <div className="relative aspect-[16/7] overflow-hidden rounded-xl mb-6">
              <Image src={img(photos.telemedicina, 900, 400)} alt="Equipo de trabajo para una consulta médica virtual" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </div>
            <h2 className="text-2xl font-semibold">Una solicitud individual</h2>
            <p className="text-muted mt-4">
              Si ya sabes cuáles servicios necesitas para una persona, puedes
              iniciar el flujo de examen virtual e indicar que la solicitud
              corresponde a una empresa.
            </p>
            <Link href="/examenes-virtuales" className="btn-secondary mt-7">
              Iniciar examen virtual →
            </Link>
          </section>
        </div>
        <p className="text-sm text-muted mt-7">
          Las condiciones y tarifas se confirman con el equipo VIP según la
          solicitud.
        </p>
      </main>
      <Footer />
    </>
  );
}
