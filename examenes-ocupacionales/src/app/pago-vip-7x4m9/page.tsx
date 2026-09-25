import type { Metadata } from "next";
import Image from "next/image";
import { PaymentOptions } from "@/components/booking/PaymentOptions";

export const metadata: Metadata = {
  title: "Medios de pago | VIP Salud Ocupacional",
  description: "Medios de pago para servicios de VIP Salud Ocupacional.",
  robots: { index: false, follow: false, nocache: true },
};

export default function PaymentPage() {
  return (
    <main id="contenido" className="standalone-payment-page">
      <section className="standalone-payment-shell">
        <div className="standalone-payment-brand">
          <Image
            src="/logo.png"
            alt="VIP Salud Ocupacional"
            width={180}
            height={80}
            className="standalone-payment-logo"
            priority
          />
          <div>
            <p className="eyebrow">VIP Salud Ocupacional</p>
            <h1 className="text-2xl font-semibold mt-1">Medios de pago</h1>
            <p className="text-sm text-muted mt-2">
              Usa esta página únicamente cuando el equipo VIP te haya indicado
              el valor a cancelar.
            </p>
          </div>
        </div>
        <PaymentOptions amount={null} showTotal={false} />
      </section>
    </main>
  );
}
