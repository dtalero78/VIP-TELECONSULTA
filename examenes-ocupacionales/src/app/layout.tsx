import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vipexamenesocupacionales.com"),
  title: "Exámenes Médicos Ocupacionales Online | VIP Salud Ocupacional",
  description:
    "Solicita tu examen médico ocupacional virtual con VIP Salud Ocupacional. Consulta servicios, agenda y atención para empresas.",
  keywords: [
    "exámenes ocupacionales",
    "examen ocupacional virtual",
    "examen ocupacional online",
    "certificado ARL",
    "salud ocupacional Colombia",
    "VIP Salud Ocupacional",
  ],
  icons: {
    icon: [
      {
        url: "/vip-icon-32.png?v=vip-20260921",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/vip-icon-192.png?v=vip-20260921",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    apple: [
      {
        url: "/vip-icon-180.png?v=vip-20260921",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  alternates: {
    canonical: "https://vipexamenesocupacionales.com",
  },
  openGraph: {
    title: "Exámenes Médicos Ocupacionales Online | VIP Salud Ocupacional",
    description:
      "Inicia tu solicitud de examen ocupacional virtual y recibe orientación del equipo VIP.",
    url: "https://vipexamenesocupacionales.com",
    siteName: "VIP Salud Ocupacional",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Exámenes médicos ocupacionales online | VIP Salud Ocupacional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Exámenes Médicos Ocupacionales Online | VIP Salud Ocupacional",
    description:
      "Inicia tu solicitud de examen ocupacional virtual y recibe orientación del equipo VIP.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
