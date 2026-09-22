import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { company } from "@/lib/site";
import { whatsappLinks, mapsHref } from "@/lib/contact";
import { PRIVACY_PATH } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Política de privacidad y tratamiento de datos | VIP",
  description: "Conoce cómo VIP Salud Ocupacional trata la información de tu solicitud y los canales para ejercer tus derechos.",
  alternates: { canonical: PRIVACY_PATH },
};

const sections = [
  {
    title: "Información y finalidades",
    paragraphs: [
      "Al diligenciar una solicitud proporcionas tu identificación, nombres, datos de contacto, ciudad, información de la empresa o solicitante, servicios elegidos y horario. También se generan la referencia de la solicitud, su estado y registros necesarios para gestionar el proceso.",
      "Usamos esta información para verificar solicitudes anteriores, preparar tu orden de servicio, coordinar la cita, comunicarnos sobre tu atención, orientar la validación del pago y atender consultas o reclamos. La autorización del formulario corresponde a estas finalidades; no constituye una suscripción a publicidad.",
    ],
  },
  {
    title: "Autorización y datos sensibles",
    paragraphs: [
      "Antes de continuar solicitamos tu autorización mediante una casilla sin marcar. Puedes consultar esta política antes de decidir. Conservamos constancia de la autorización asociada a la solicitud.",
      "Los datos sobre salud son sensibles. Su tratamiento requiere autorización explícita, salvo las excepciones legales aplicables. No estás obligado a autorizar el tratamiento de datos sensibles ni a responder preguntas sobre ellos. Si tienes dudas sobre la información necesaria para tu atención, comunícate con VIP antes de enviarla.",
      "Este formulario prepara una solicitud; no reemplaza el consentimiento informado de una valoración médica. Evita incluir historias clínicas o resultados en mensajes de cotización. Si actúas por otra persona, debes contar con la autorización correspondiente. La atención de menores requiere la intervención de su representante y la protección de sus derechos.",
    ],
  },
  {
    title: "Gestión de la solicitud y proveedores",
    paragraphs: [
      "Los datos necesarios de la solicitud se comunican a VIP Mediconecta para consultar procesos anteriores y gestionar la orden y la agenda. El personal autorizado y los proveedores que intervengan en alojamiento, soporte o atención deben tratar la información únicamente conforme a su función y a las obligaciones de confidencialidad aplicables.",
      "Al abrir WhatsApp o un enlace de pago o de atención, accedes a un servicio externo con sus propias condiciones de privacidad. Revisa esas condiciones antes de compartir información. La selección de servicios no autoriza divulgar tu historia clínica a tu empleador.",
    ],
  },
  {
    title: "Seguridad, sesión y conservación",
    paragraphs: [
      "La aplicación utiliza una sesión para recuperar tu solicitud y controles para restringir el acceso a los datos. Los datos de la solicitud guardados por esta aplicación se cifran en el servidor. Ningún sistema elimina por completo los riesgos de Internet; usa un dispositivo de confianza y no compartas enlaces o referencias privadas.",
      "La sesión de recuperación dura 24 horas. Su vencimiento no equivale a eliminar una orden registrada. La información se conserva durante el tiempo necesario para gestionar la atención y cumplir las obligaciones legales aplicables; las solicitudes de eliminación se revisan teniendo en cuenta esas obligaciones.",
      "Para recuperar la solicitud en la misma pestaña, el navegador conserva temporalmente un identificador de sesión; los datos personales permanecen cifrados en el servidor y no se guardan directamente en el almacenamiento del navegador. Las imágenes alojadas por proveedores externos pueden implicar la comunicación de datos técnicos, como la dirección IP, al cargar recursos.",
    ],
  },
  {
    title: "Tus derechos",
    paragraphs: [
      "Puedes conocer, actualizar y rectificar tus datos; solicitar prueba de la autorización y conocer el uso de tu información; acceder gratuitamente a tus datos y solicitar la revocación de la autorización o la supresión cuando proceda. También puedes acudir a la Superintendencia de Industria y Comercio después de agotar la consulta o el reclamo ante el responsable, según corresponda.",
      "Para ejercer tus derechos, contacta a VIP por los canales indicados abajo. Explica tu solicitud y proporciona un medio de respuesta. Verificaremos tu identidad o representación antes de entregar información. No envíes datos clínicos por el canal inicial de contacto. Las consultas y reclamos se tramitan en los términos de la normativa colombiana de protección de datos.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto w-full max-w-4xl px-5 py-12 sm:py-16">
        <p className="eyebrow">Tu información, con claridad</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mt-4">Política de privacidad y tratamiento de datos</h1>
        <p className="text-muted mt-5 leading-relaxed">Esta política describe el tratamiento de la información recibida a través del sitio web y del formulario de solicitudes de {company.legalName}.</p>
        <p className="text-sm text-muted mt-3">Vigencia y última actualización: 21 de septiembre de 2026.</p>
        <section className="card p-6 sm:p-8 my-8">
          <h2 className="text-xl font-semibold">Responsable del tratamiento</h2>
          <p className="mt-3">{company.legalName} · NIT {company.nit}</p>
          <p className="text-muted mt-2"><a href={mapsHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{company.address} ↗</a></p>
          <p className="text-muted mt-2">Teléfono y WhatsApp: <a href={whatsappLinks.general} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{company.whatsapp} ↗</a></p>
        </section>
        <div className="space-y-8">
          {sections.map((section, i) => (
            <section key={section.title} className="border-b border-border pb-8">
              <h2 className="text-xl sm:text-2xl font-semibold">{i + 1}. {section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="text-muted mt-4 leading-relaxed">{paragraph}</p>)}
            </section>
          ))}
        </div>
        <section className="card p-6 sm:p-8 mt-8">
          <h2 className="text-xl font-semibold">Consultas sobre tus datos</h2>
          <p className="text-muted mt-3">{company.hours} También puedes presentar tu solicitud en nuestra dirección de atención.</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <a href={whatsappLinks.support} target="_blank" rel="noopener noreferrer" className="btn-primary">Contactar a VIP por WhatsApp ↗</a>
            <a href={company.phoneHref} className="btn-secondary">Llamar a VIP</a>
          </div>
        </section>
        <p className="text-sm text-muted leading-relaxed mt-8">Marco de referencia: <a className="underline underline-offset-4" href="https://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html" target="_blank" rel="noopener noreferrer">Ley 1581 de 2012</a> y su reglamentación aplicable. Esta política podrá actualizarse cuando cambien las finalidades o los procesos; la versión vigente estará disponible en esta página y se solicitará una nueva autorización cuando corresponda.</p>
      </main>
      <Footer />
    </>
  );
}
