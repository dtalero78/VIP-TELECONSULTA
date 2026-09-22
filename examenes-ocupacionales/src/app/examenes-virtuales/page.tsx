import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/BookingFlow";
export const metadata: Metadata = {
  title: "Solicita tu examen virtual | VIP Salud Ocupacional",
  robots: { index: false, follow: false },
  alternates: { canonical: "/examenes-virtuales" },
};
export default function Page() {
  return (
    <main id="contenido">
      <BookingFlow />
    </main>
  );
}
