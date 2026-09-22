import { company } from "./site";
function whatsapp(message: string, phone = company.phoneHref.replace(/\D/g, "")) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
export const whatsappLinks = {
  general: whatsapp(
    "Hola, quiero información sobre los servicios de VIP Salud Ocupacional.",
  ),
  companies: whatsapp(
    "Hola, quiero orientación para cotizar los servicios de salud ocupacional de mi empresa.",
    "573134010901",
  ),
  support: whatsapp(
    "Hola, necesito orientación con mi solicitud o certificado. Por favor indíquenme cómo continuar de forma segura.",
  ),
  customerService: whatsapp(
    "Hola, necesito ayuda del equipo de servicio al cliente de VIP Salud Ocupacional.",
    "573102482964",
  ),
};
export const contactChannels = [
  { label: "Telemedicina", phone: "301 241 9677", href: whatsappLinks.general, primary: true },
  { label: "Comercial", phone: "313 401 0901", href: whatsappLinks.companies, primary: false },
  { label: "Servicio al cliente", phone: "310 248 2964", href: whatsappLinks.customerService, primary: false },
] as const;
export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;
