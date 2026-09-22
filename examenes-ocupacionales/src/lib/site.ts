// Datos del sitio — VIP Salud Ocupacional S.A.S.
// Branding e información tomados de la app VIP (examenesparapase.com).

export const company = {
  name: "VIP Salud Ocupacional",
  legalName: "VIP Salud Ocupacional S.A.S.",
  brand: "VIP Salud Ocupacional",
  subtitle: "Exámenes Médicos Ocupacionales",
  nit: "901434471-7",
  email: null as string | null,
  phone: "301 241 9677",
  phoneHref: "tel:+573012419677",
  whatsapp: "+57 301 241 9677",
  whatsappHref:
    "https://wa.me/573012419677?text=Hola%2C%20quiero%20hacer%20mi%20examen%20m%C3%A9dico%20ocupacional%20virtual.",
  hours: "Lunes a viernes 7:00 a.m. a 4:00 p.m. Sábados 7:00 a.m. a 12:15 p.m.",
  address: "Carrera 28A No. 51-70, Bogotá D.C., Colombia",
} as const;

// CTA principal (funnel del examen virtual): usado en nav y cierre.
export const REQUEST_HREF = "/examenes-virtuales";
export const REQUEST_LABEL = "Exámenes virtuales";

export const navLinks = [
  { label: "Servicios", href: "/#servicios" },
  { label: "Cómo funciona", href: "/#proceso" },
  { label: "Preguntas", href: "/#faq" },
  { label: "Empresas / Cotización", href: "/empresas" },
  { label: "Contacto", href: "/#contacto" },
] as const;

export const stats = [
  { value: "100%", label: "Examen ocupacional en línea, sin desplazarte" },
  { value: "Mismo día", label: "Certificado digital al finalizar la consulta" },
  { value: "2020", label: "Telemedicina habilitada por el Ministerio de Salud" },
  { value: "Nacional", label: "Atención virtual en toda Colombia" },
] as const;

export const faqs = [
  {
    q: "¿El examen médico ocupacional virtual tiene validez?",
    a: "Sí. La atención por telemedicina está habilitada en Colombia y emitimos un certificado de aptitud laboral válido, firmado por un médico especialista en salud ocupacional.",
  },
  {
    q: "¿Qué necesito para hacer mi examen ocupacional en línea?",
    a: "Un celular o computador con cámara, tu documento de identidad y conexión a internet. Nosotros te guiamos por WhatsApp y luego por videollamada.",
  },
  {
    q: "¿Cuándo recibo el certificado de aptitud?",
    a: "El mismo día. Apenas termina la valoración te enviamos el enlace para descargar tu certificado en formato digital.",
  },
  {
    q: "¿Atienden a empresas?",
    a: "Sí. Gestionamos exámenes de ingreso, periódicos y de retiro a escala para empresas, en modalidad virtual o presencial.",
  },
  {
    q: "¿Qué incluye el examen según el cargo?",
    a: "La valoración médica ocupacional y, cuando el cargo lo exige, paraclínicos como visiometría, audiometría, espirometría o electrocardiograma.",
  },
  {
    q: "¿También puedo asistir de forma presencial?",
    a: "Claro. Puedes acercarte a nuestra sede en Bogotá, Carrera 28A No. 51-70, dentro del horario de atención.",
  },
] as const;

export const coverage = [
  "Bogotá",
  "Cali",
  "Medellín",
  "Barranquilla",
  "Cartagena",
  "+60 municipios",
];

// Logos de clientes: marcas reales no disponibles en librerías de íconos,
// se representan con monogramas SVG limpios. TODO: reemplazar por logos reales.
export const clients = ["SITEL", "DIAN", "Konecta", "Atento", "Servientrega", "Falabella"];

// Fotografía real de Unsplash (IDs verificados con HTTP 200).
// TODO: reemplazar por fotos reales de la IPS cuando estén disponibles.
const UNSPLASH = "https://images.unsplash.com";
export const img = (id: string, w: number, h: number) =>
  `${UNSPLASH}/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const photos = {
  diagnostico: "photo-1666214280557-f1b5022eb634", // clínicos revisando imágenes diagnósticas
  consulta: "photo-1631217868264-e5b90bb7e133", // médico con paciente en consultorio
  sede: "photo-1551076805-e1869033e561", // sala clínica limpia (IPS)
  telemedicina: "photo-1576091160550-2173dba999ef", // laptop + estetoscopio (atención virtual)
  especialista: "photo-1622253692010-333f2da6031d", // profesional de la salud sonriendo
} as const;

