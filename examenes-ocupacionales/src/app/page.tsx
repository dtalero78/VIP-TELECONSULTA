import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Trayectoria } from "@/components/Trayectoria";
import { Servicios } from "@/components/Servicios";
import { TiposExamen } from "@/components/TiposExamen";
import { Especializados } from "@/components/Especializados";
import { Paraclinicos } from "@/components/Paraclinicos";
import { Proceso } from "@/components/Proceso";
import { Equipo } from "@/components/Equipo";
import { Empresa } from "@/components/Empresa";
import { FAQ } from "@/components/FAQ";
import { CtaContacto } from "@/components/CtaContacto";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Trayectoria />
        <Proceso />
        <Servicios />
        <TiposExamen />
        <Especializados />
        <Paraclinicos />
        <Equipo />
        <Empresa />
        <FAQ />
        <CtaContacto />
      </main>
      <Footer />
      <StructuredData />
    </>
  );
}
