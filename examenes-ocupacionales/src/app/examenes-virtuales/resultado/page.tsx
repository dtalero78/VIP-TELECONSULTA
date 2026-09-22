import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/BookingFlow";
export const metadata: Metadata = {
  title: "Estado de tu solicitud | VIP",
  robots: { index: false, follow: false },
  alternates: { canonical: "/examenes-virtuales/resultado" },
};
export default function Page() {
  return (
    <main id="contenido">
      <BookingFlow resultOnly />
    </main>
  );
}
