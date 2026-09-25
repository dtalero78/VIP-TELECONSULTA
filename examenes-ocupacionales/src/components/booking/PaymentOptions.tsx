"use client";
import Image from "next/image";
import { useState } from "react";
import { formatCOP, paymentAccounts } from "@/lib/service-pricing";
import { whatsappLinks } from "@/lib/contact";

export function PriceTotal({ amount }: { amount: number | null }) {
  return (
    <div
      className="price-total"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div>
        <span className="eyebrow">Total de tu selección</span>
        <p className="text-sm text-muted mt-1">
          {amount === null
            ? "Consulta con VIP el valor de estos servicios."
            : "Valor total en pesos colombianos"}
        </p>
      </div>
      <strong className="price-value">
        {amount === null ? "Por confirmar" : formatCOP(amount)}
      </strong>
    </div>
  );
}

export function PaymentOptions({
  amount,
  confirmed = false,
  showTotal = true,
}: {
  amount: number | null;
  confirmed?: boolean;
  showTotal?: boolean;
}) {
  const [copied, setCopied] = useState("");

  return (
    <section className="payment-options" aria-label="Medios de pago">
      {showTotal && <PriceTotal amount={amount} />}

      <div className="payment-heading">
        <div>
          <p className="eyebrow">Paga como prefieras</p>
          <h2 className="text-xl font-semibold mt-1">Medios de pago</h2>
        </div>
        <span className="payment-status">Validación por VIP</span>
      </div>

      <div className="wompi-option">
        <div>
          <strong>Pago en línea con Wompi</strong>
          <p className="text-sm text-muted mt-1">
            Temporalmente no disponible. Puedes usar los medios de pago que
            aparecen abajo.
          </p>
        </div>
        <button
          type="button"
          disabled
          aria-describedby="wompi-maintenance"
          className="btn-secondary"
        >
          Pagar con Wompi
        </button>
      </div>

      <p id="wompi-maintenance" className="text-xs text-muted mb-5">
        Estamos habilitando este canal para ti.
      </p>

      <div className="payment-grid">
        {paymentAccounts.map((account) => (
          <article className="payment-account" key={account.name}>
            <span aria-hidden="true" className="payment-icon">
              {account.icon}
            </span>
            <div>
              <h3 className="font-semibold">{account.name}</h3>
              <p className="text-xs text-muted">{account.type}</p>
              <p className="account-number">{account.number}</p>
            </div>
            <div className="ml-auto flex gap-2">
              {account.number.split(" / ").map((number, index, entries) => (
                <button
                  key={number}
                  type="button"
                  className="copy-account"
                  aria-label={
                    entries.length > 1
                      ? `Copiar llave ${number}`
                      : `Copiar ${account.name}`
                  }
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(number);
                      setCopied(`${account.name}: ${number} copiado`);
                    } catch {
                      setCopied(
                        "No se pudo copiar. Puedes seleccionar el número de cuenta.",
                      );
                    }
                  }}
                >
                  {entries.length > 1 ? `Copiar llave ${index + 1}` : "Copiar"}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-muted mt-2 min-h-5" role="status">
        {copied}
      </p>

      <div className="payment-qr-card">
        <div className="payment-qr-copy">
          <p className="eyebrow">También puedes pagar escaneando</p>
          <h3 className="font-semibold mt-1">QR oficial de pago VIP</h3>
          <p className="text-sm text-muted mt-2">
            Escanéalo desde la opción de pagos QR de una entidad habilitada.
            Antes de confirmar, verifica que el destinatario sea VIP SALUD
            OCUPACIONAL. El pago se confirma en tu aplicación bancaria, no en
            esta página.
          </p>
          <p className="text-xs text-muted mt-2">
            QR Bancolombia / Redeban.
          </p>
        </div>

        <div
          className="payment-qr-image-wrap"
          style={{ width: "min(400px, 88vw)", maxWidth: "100%" }}
        >
          <Image
            src="/images/pagos/qr-medios-de-pago-vip.png"
            alt="Código QR oficial de pago de VIP Salud Ocupacional"
            className="payment-qr-image"
            width={972}
            height={972}
            sizes="(max-width: 640px) 88vw, 400px"
            style={{ width: "100%", height: "auto" }}
            priority={false}
          />
          <a
            href="/images/pagos/qr-medios-de-pago-vip.png"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-3"
            style={{ display: "inline-flex" }}
          >
            Abrir QR en tamaño completo ↗
          </a>
        </div>
      </div>

      <div className="payment-instructions">
        <h3 className="font-semibold">
          {confirmed
            ? "Continúa con tu pago y atención"
            : "Antes de realizar el pago"}
        </h3>
        <ol className="list-decimal pl-5 space-y-2 mt-3 text-sm text-muted">
          <li>
            {confirmed
              ? "Revisa el total y los datos de tu solicitud."
              : "Confirma primero tu solicitud y revisa el valor total."}
            {amount === null &&
              " El valor está pendiente: consulta con VIP antes de transferir."}
          </li>
          <li>
            Elige uno de los medios disponibles y conserva el comprobante.
          </li>
          <li>
            Contacta al equipo VIP para recibir las instrucciones de validación.
            El pago no se confirma automáticamente en esta página.
          </li>
        </ol>
        <a
          href={whatsappLinks.support}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-4"
        >
          Recibir orientación por WhatsApp ↗
        </a>
      </div>

      {confirmed && (
        <p className="text-sm text-muted mt-5">
          Para tu atención, busca un espacio privado y comprueba tu conexión a
          internet, cámara y sonido. El equipo VIP te indicará cómo continuar y
          consultar tu certificado.
        </p>
      )}
    </section>
  );
}
