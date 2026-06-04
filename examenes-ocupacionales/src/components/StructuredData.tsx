import { company, faqs } from "@/lib/site";

const SITE_URL = "https://vipexamenesocupacionales.com";

const medicalClinic = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: company.legalName,
  alternateName: "VIP Salud Ocupacional",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/logo.png`,
  telephone: company.phoneHref.replace("tel:", ""),
  medicalSpecialty: "Occupational",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Carrera 28A No. 51-70",
    addressLocality: "Bogotá D.C.",
    addressRegion: "Cundinamarca",
    postalCode: "111321",
    addressCountry: "CO",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 4.6394,
    longitude: -74.0826,
  },
  areaServed: { "@type": "Country", name: "Colombia" },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "16:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "07:00",
      closes: "12:15",
    },
  ],
};

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalClinic) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
