import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    "Haz tu examen médico ocupacional online, sin desplazarte. Atención por videollamada con certificado digital al finalizar. Telemedicina habilitada por el Ministerio de Salud. Empresas y personas naturales en toda Colombia.",
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
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
  alternates: {
    canonical: "https://vipexamenesocupacionales.com",
  },
  openGraph: {
    title: "Exámenes Médicos Ocupacionales Online | VIP Salud Ocupacional",
    description:
      "Haz tu examen ocupacional virtual sin desplazarte. Certificado digital al finalizar la consulta.",
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
      "Haz tu examen ocupacional virtual sin desplazarte. Certificado digital al finalizar la consulta.",
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
      <body className="min-h-full flex flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
