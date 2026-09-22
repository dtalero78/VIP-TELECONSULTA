"use client";

import Link from "next/link";
import Image from "next/image";
import { PRIVACY_PATH } from "@/lib/privacy";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  emptyPatient,
  exams,
  validatePatient,
  colombiaToday,
  type Patient,
  type FieldErrors,
  type BookingConfig,
  type BookingView,
  type DuplicateKind,
} from "@/lib/booking";
import { whatsappLinks } from "@/lib/contact";
import {
  cities,
  documentTypes,
  type DocumentType,
} from "@/lib/booking-options";
import { serviceTotal, formatCOP } from "@/lib/service-pricing";
import { PaymentOptions, PriceTotal } from "./PaymentOptions";
import { AppointmentPicker } from "./AppointmentPicker";
import { VideoTutorial } from "../VideoTutorial";

import { api, ApiError } from "@/lib/api-client";
const stepLabels = [
  "Identificación",
  "Tus datos",
  "Servicios",
  "Fecha y hora",
  "Revisión",
];
const stepsFields: (keyof Patient)[][] = [
  ["documentType", "document", "consent"],
  [
    "firstName",
    "middleName",
    "lastName",
    "secondLastName",
    "phone",
    "account",
    "company",
    "job",
    "city",
  ],
  ["exams"],
  ["date", "time"],
  [],
];
const duplicateText: Record<DuplicateKind, string> = {
  none: "",
  pendiente: "Hay una solicitud pendiente asociada a este documento.",
  expirado: "Hay una cita anterior cuya fecha ya pasó.",
  atendido:
    "Hay una atención anterior registrada. Esto no confirma que el certificado esté disponible.",
};

export function BookingFlow({ resultOnly = false }: { resultOnly?: boolean }) {
  const [config, setConfig] = useState<BookingConfig | null>(null),
    [view, setView] = useState<BookingView | null>(null);
  const [patient, setPatient] = useState<Patient>({ ...emptyPatient }),
    [step, setStep] = useState(0),
    [started, setStarted] = useState(resultOnly);
  const [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [errors, setErrors] = useState<FieldErrors>({}),
    [notice, setNotice] = useState("");
  const [duplicate, setDuplicate] = useState<DuplicateKind>("none"),
    [allowDuplicate, setAllowDuplicate] = useState(false);
  const [slots, setSlots] = useState<string[]>([]),
    [slotsLoading, setSlotsLoading] = useState(false),
    [slotsError, setSlotsError] = useState(""),
    [slotRefresh, setSlotRefresh] = useState(0);
  const [reviewed, setReviewed] = useState(false),
    [rescheduling, setRescheduling] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null),
    critical = useRef(false),
    saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    revision = useRef(0);
  const [saved, setSaved] = useState("");
  const [otherCity, setOtherCity] = useState(false);
  const total = serviceTotal(patient.exams);
  const [dateBounds] = useState(() => ({
    min: colombiaToday(),
    max: colombiaToday(new Date(Date.now() + 90 * 86400000)),
  }));
  const load = useCallback(async () => {
    await Promise.resolve();
    setError("");
    try {
      const c = await api<BookingConfig>("config");
      setConfig(c);
      const s = await api<BookingView>("session", {});
      setView(s);
      if (s.patient) {
        setPatient({
          ...s.patient,
          exams: [...new Set(["osteomuscular" as const, ...s.patient.exams])],
        });
        setSaved("Solicitud recuperada de tu sesión.");
        setStarted(true);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos iniciar la solicitud.",
      );
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  useEffect(() => {
    if (started) heading.current?.focus();
  }, [step, started, view?.order]);
  useEffect(() => {
    if (
      !view ||
      view.order !== "draft" ||
      !patient.consent ||
      busy ||
      critical.current
    )
      return;
    const rev = revision.current;
    saveTimer.current = setTimeout(() => {
      void api<BookingView>("draft", { patient })
        .then(() => {
          if (revision.current === rev)
            setSaved("Guardado en esta sesión por 24 horas.");
        })
        .catch(() =>
          setSaved("Sin guardar. Revisa la conexión antes de cerrar."),
        );
    }, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [patient, view, busy]);
  useEffect(() => {
    if (!patient.date || (!rescheduling && step !== 3)) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setSlotsLoading(true);
        setSlotsError("");
        setSlots([]);
      }
    });
    api<{ slots: string[] }>("availability", { date: patient.date })
      .then((r) => {
        if (active) setSlots(r.slots);
      })
      .catch((e) => {
        if (active) setSlotsError(e.message);
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [patient.date, step, rescheduling, slotRefresh]);
  function change<K extends keyof Patient>(key: K, value: Patient[K]) {
    revision.current++;
    setSaved("Guardando…");
    setReviewed(false);
    setPatient((p) => ({
      ...p,
      [key]: value,
      ...(key === "date" ? { time: "" } : {}),
      ...(key === "account" && value === "particular" ? { company: "" } : {}),
    }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (key === "document" || key === "documentType") {
      setDuplicate("none");
      setAllowDuplicate(false);
    }
  }
  async function run(work: () => Promise<void>) {
    if (critical.current) return;
    critical.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        if (e.fields) setErrors(e.fields);
        if (
          ["UNCERTAIN", "LOCKED", "CONNECTION", "DUPLICATE"].includes(e.code)
        ) {
          try {
            const s = await api<BookingView>("status");
            setView(s);
            if (e.code === "DUPLICATE") {
              setDuplicate(s.duplicate);
              setStep(0);
            }
          } catch {
            /* Keep current data and explicit error. */
          }
        }
      } else setError("No pudimos completar la operación. Intenta nuevamente.");
    } finally {
      critical.current = false;
      setBusy(false);
    }
  }
  async function next(event: FormEvent) {
    event.preventDefault();
    setError("");
    const all = validatePatient(patient),
      visible: FieldErrors = {};
    for (const key of stepsFields[step]) if (all[key]) visible[key] = all[key];
    setErrors(visible);
    if (Object.keys(visible).length) {
      setError("Revisa los campos señalados.");
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    await run(async () => {
      const s = await api<BookingView>("draft", { patient });
      setView(s);
      if (step === 0 && !allowDuplicate) {
        const d = await api<{ kind: DuplicateKind }>("duplicate", {});
        setDuplicate(d.kind);
        if (d.kind !== "none") return;
      }
      setStep((s) => Math.min(s + 1, 4));
    });
  }
  function field(
    key: keyof Patient,
    label: string,
    options: {
      optional?: boolean;
      type?: string;
      autoComplete?: string;
      max?: number;
      inputMode?: "numeric" | "tel";
    } = {},
  ) {
    return (
      <div className="form-field">
        <label htmlFor={key}>
          {label}
          {options.optional && (
            <span className="text-muted font-normal"> · opcional</span>
          )}
        </label>
        <input
          id={key}
          name={key}
          type={options.type || "text"}
          value={String(patient[key])}
          onChange={(e) =>
            change(
              key,
              (key === "document"
                ? e.target.value.toUpperCase()
                : e.target.value) as never,
            )
          }
          autoComplete={options.autoComplete || "off"}
          inputMode={options.inputMode}
          maxLength={options.max || 120}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
        />
        <span id={`${key}-error`} className="field-error">
          {errors[key]}
        </span>
      </div>
    );
  }
  const dateSelector = (
    <AppointmentPicker
      date={patient.date}
      time={patient.time}
      min={dateBounds.min}
      max={dateBounds.max}
      slots={slots}
      loading={slotsLoading}
      error={slotsError}
      dateError={errors.date}
      timeError={errors.time}
      onDate={(date) => change("date", date)}
      onTime={(time) => change("time", time)}
      onRetry={() => setSlotRefresh((n) => n + 1)}
    />
  );

  return (
    <div className="booking-shell">
      <div className="mb-7 flex items-center justify-between gap-4">
        <Link href="/#inicio" className="inline-flex items-center gap-3 font-semibold">
          <Image
            src="/logo.png"
            alt="VIP Salud Ocupacional"
            width={88}
            height={48}
            className="h-11 w-20 object-contain"
          />
          <span className="hidden sm:inline">VIP Salud Ocupacional</span>
        </Link>
        <a
          href={whatsappLinks.support}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm font-semibold"
        >
          Necesito ayuda ↗
        </a>
      </div>
      {config?.demo && (
        <div className="demo-banner" role="status">
          <strong>Demostración · usa datos ficticios.</strong> No se crean citas
          reales ni se realizan cobros.
        </div>
      )}
      {error && (
        <div className="form-alert" role="alert">
          {error}
          {!config && (
            <button className="btn-secondary mt-3" onClick={() => void load()}>
              Volver a intentar
            </button>
          )}
        </div>
      )}
      {notice && (
        <div className="form-notice" role="status">
          {notice}
        </div>
      )}
      {!config || !view ? (
        <div className="card p-8" aria-busy={busy}>
          {busy
            ? "Preparando tu solicitud…"
            : "Puedes contactar al equipo VIP mientras recuperamos el servicio."}
        </div>
      ) : ["confirmed", "creating", "rescheduling", "uncertain"].includes(
          view.order,
        ) ? (
        <section className="card p-6 sm:p-10" aria-busy={busy}>
          <p className="eyebrow">Tu solicitud</p>
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-3xl font-semibold mt-3"
          >
            {view.order === "confirmed"
              ? config.demo
                ? "Solicitud de prueba registrada"
                : "Tu cita quedó registrada"
              : "Estamos verificando tu solicitud"}
          </h1>
          <p className="text-muted mt-4">
            {view.order === "confirmed"
              ? "Revisa los detalles de tu solicitud y continúa con el siguiente paso."
              : "No vuelvas a enviar otra solicitud. Guardamos este intento para evitar duplicados, incluso si cierras o recargas esta página."}
          </p>
          <dl className="review-list mt-6">
            <div>
              <dt>Referencia</dt>
              <dd className="break-all">{view.reference}</dd>
            </div>
            <div>
              <dt>Exámenes seleccionados</dt>
              <dd>
                {exams
                  .filter((exam) => view.patient?.exams.includes(exam.id))
                  .map((exam) => exam.label)
                  .join(" + ") || "Consulta los detalles con VIP"}
              </dd>
            </div>
            <div>
              <dt>Cita</dt>
              <dd>
                {view.patient?.date} · {view.patient?.time} (Colombia)
              </dd>
            </div>
            <div>
              <dt>Pago</dt>
              <dd>
                {
                  {
                    not_configured: "Pago en línea no habilitado",
                    not_required: "Consulta las instrucciones de pago",
                    manual_pending: "Pendiente de validación por VIP",
                    pending: "Pendiente de verificación",
                    approved: "Verificado por Wompi",
                    declined: "Rechazado",
                    error: "No completado",
                    voided: "Anulado",
                    abandoned: "Proceso de pago interrumpido",
                  }[view.payment]
                }
              </dd>
            </div>
            <div>
              <dt>Atención</dt>
              <dd>
                {view.attention === "completed"
                  ? "Atención anterior registrada · consulta el certificado con VIP"
                  : view.hasOrder
                    ? "Pendiente · aún no es un certificado"
                    : "Sin iniciar"}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3 mt-7">
            <button
              disabled={busy}
              className="btn-secondary"
              onClick={() =>
                void run(async () => {
                  const s = await api<BookingView>("reconcile", {});
                  setView(s);
                  setNotice(
                    s.order === "confirmed"
                      ? "Estado actualizado."
                      : "El resultado sigue pendiente de verificación. No hemos reenviado la orden.",
                  );
                })
              }
            >
              Consultar estado
            </button>
            {view.order === "confirmed" && (
              <>
                <button
                  disabled={busy}
                  className="btn-primary"
                  onClick={() =>
                    void run(async () => {
                      if (config.demo) {
                        setNotice(
                          "Fin de la demostración. En el servicio activo continuarías en el formulario de atención de VIP; no se ha creado una historia clínica.",
                        );
                        return;
                      }
                      const r = await api<{ url: string }>("continue", {});
                      window.location.assign(r.url);
                    })
                  }
                >
                  Continuar con mi atención
                </button>
                <button
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => setRescheduling((v) => !v)}
                >
                  Cambiar fecha
                </button>
              </>
            )}
          </div>
          {view.order === "confirmed" &&
            config.paymentReady &&
            view.payment !== "approved" &&
            config.paymentPolicy === "required" && (
              <div className="mt-6">
                <p className="text-muted mb-3">
                  El pago se confirma mediante Wompi. Volver a esta página no
                  confirma un cobro.
                </p>
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      const r = await api<{ url: string }>("checkout", {});
                      window.location.assign(r.url);
                    })
                  }
                >
                  Continuar a Wompi
                </button>
                <button
                  className="btn-secondary ml-2"
                  disabled={busy}
                  onClick={() =>
                    void run(async () =>
                      setView(await api<BookingView>("abandon-payment", {})),
                    )
                  }
                >
                  Continuar después
                </button>
              </div>
            )}
          {rescheduling && (
            <form
              className="mt-8 border-t border-border pt-6"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  setView(
                    await api<BookingView>("reschedule", {
                      date: patient.date,
                      time: patient.time,
                    }),
                  );
                  setRescheduling(false);
                  setNotice("Fecha actualizada.");
                });
              }}
            >
              <h2 className="text-xl font-semibold mb-4">
                Elige una nueva fecha
              </h2>
              {dateSelector}
              <button
                className="btn-primary mt-5"
                disabled={busy || slotsLoading || !slots.includes(patient.time)}
              >
                Confirmar cambio de fecha
              </button>
            </form>
          )}
          {view.order === "confirmed" && (
            <PaymentOptions
              confirmed
              amount={view.amount === null ? total : view.amount / 100}
            />
          )}
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/" className="btn-secondary">
              Volver a la página principal
            </Link>
            {view.order === "confirmed" && (
              <button
                disabled={busy}
                className="btn-primary"
                onClick={() =>
                  void run(async () => {
                    await api("new-session", {});
                    // A full document navigation clears the previous patient's form state and pending effects.
                    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                    window.location.assign("/examenes-virtuales");
                  })
                }
              >
                Iniciar otra solicitud
              </button>
            )}
          </div>
        </section>
      ) : !started ? (
        <section className="booking-welcome card">
          <Image src="/logo.png" alt="VIP" width={120} height={96} className="mx-auto mb-4 h-24 w-30 object-contain" priority />
          <p className="eyebrow">VIP Salud Ocupacional</p>
          <h1>
            Agenda tu examen
            <br />
            <span className="text-accent-strong">sin complicaciones.</span>
          </h1>
          <p className="text-muted welcome-description">
            Tus datos, tus servicios y el horario que prefieras. Te acompañamos
            paso a paso.
          </p>
          <div className="welcome-price">
            <strong>{formatCOP(43000)}</strong>
            <span>Examen médico de ingreso</span>
          </div>
          <p className="text-sm text-muted">
            Con audiometría, visiometría o ambas:{" "}
            <strong>{formatCOP(52000)} en total.</strong>
          </p>
          <div className="mx-auto max-w-[460px]"><VideoTutorial /></div>
          <button
            disabled={busy}
            className="btn-primary mt-6"
            onClick={() => setStarted(true)}
          >
            Comenzar mi solicitud <span aria-hidden="true">→</span>
          </button>
          <div className="welcome-steps">
            <span>01 · Tus datos</span>
            <span>02 · Servicios y cita</span>
            <span>03 · Revisión y pago</span>
          </div>
          <p className="text-sm text-muted">
            ¿Es para tu equipo?{" "}
            <Link href="/empresas" className="underline text-accent-strong">
              Atención a empresas
            </Link>
          </p>
        </section>
      ) : (
        <section className="card overflow-hidden">
          <div className="border-b border-border p-5 sm:p-8 bg-surface-2">
            <div className="flex justify-between gap-4 text-sm">
              <span className="font-semibold text-accent-strong">
                Paso {step + 1} de {stepLabels.length}
              </span>
              <span className="text-muted">{stepLabels[step]}</span>
            </div>
            <div
              role="progressbar"
              aria-label="Progreso de solicitud"
              aria-valuenow={Math.round(((step + 1) / stepLabels.length) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="booking-progress mt-4"
            >
              <div style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}>
                {Math.round(((step + 1) / stepLabels.length) * 100)}%
              </div>
            </div>
            <ol className="hidden sm:flex justify-between text-xs mt-3 text-muted">
              {stepLabels.map((label, i) => (
                <li
                  key={label}
                  aria-current={step === i ? "step" : undefined}
                  className={step === i ? "font-semibold text-fg" : ""}
                >
                  {label}
                </li>
              ))}
            </ol>
          </div>
          <form
            noValidate
            onSubmit={
              step === 4
                ? (e) => {
                    e.preventDefault();
                    if (!reviewed) return;
                    void run(async () => {
                      await api("draft", { patient });
                      setView(await api<BookingView>("confirm", {}));
                    });
                  }
                : next
            }
            className="p-5 sm:p-8"
            aria-busy={busy}
          >
            <h1
              ref={heading}
              tabIndex={-1}
              className="text-2xl sm:text-3xl font-semibold mb-3"
            >
              {
                [
                  "Primero, tu documento",
                  "Tus datos de contacto",
                  "¿Qué servicios necesitas?",
                  "Elige tu fecha y hora",
                  "Revisa tu solicitud",
                ][step]
              }
            </h1>
            <p className="text-muted mb-7">
              {
                [
                  "Usaremos estos datos para preparar la solicitud y revisar si tienes un proceso anterior.",
                  "Completa tus nombres, celular y ciudad.",
                  "Selecciona los servicios solicitados por tu empresa. Si tienes dudas, consulta al equipo VIP.",
                  "La disponibilidad puede cambiar hasta que confirmes la solicitud.",
                  "Asegúrate de que tus datos de contacto y el horario sean correctos.",
                ][step]
              }
            </p>
            {step === 0 && (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="form-field">
                    <label htmlFor="documentType">Tipo de documento</label>
                    <select
                      id="documentType"
                      value={patient.documentType}
                      onChange={(e) =>
                        change("documentType", e.target.value as DocumentType)
                      }
                      aria-invalid={!!errors.documentType}
                      aria-describedby="documentType-error"
                    >
                      {documentTypes.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <p id="documentType-error" className="field-error">
                      {errors.documentType}
                    </p>
                  </div>
                  {field("document", "Número de documento", {
                    inputMode:
                      patient.documentType === "PASS" ||
                      patient.documentType === "CE"
                        ? undefined
                        : "numeric",
                    max: 20,
                  })}
                </div>
                <label className="check-row mt-5">
                  <input
                    type="checkbox"
                    checked={patient.consent}
                    onChange={(e) => change("consent", e.target.checked)}
                    aria-invalid={!!errors.consent}
                    aria-describedby="consent-error"
                  />
                  <span>
                    {config.demo ? (
                      "Entiendo que esta es una demostración y usaré únicamente datos ficticios."
                    ) : (
                      <>
                        Autorizo el uso de mis datos, incluida la información
                        de salud asociada a los exámenes que solicito, y su envío a VIP
                        Mediconecta para verificar solicitudes anteriores y
                        gestionar mi orden de servicio.
                        {config.privacyUrl && (
                          <>
                            {" "}
                            <a
                              className="underline"
                              href={config.privacyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Consultar política de privacidad de VIP
                            </a>
                            .
                          </>
                        )}
                      </>
                    )}
                  </span>
                </label>
                <p id="consent-error" className="field-error">
                  {errors.consent}
                </p>
                {config.demo && (
                  <details className="mt-5 text-sm text-muted">
                    <summary className="cursor-pointer">
                      Datos para explorar la demostración
                    </summary>
                    <p className="mt-2">
                      900000001: pendiente · 900000002: vencida · 900000003:
                      atendida · 900000004: error · 900000005: respuesta
                      perdida. Para una solicitud nueva usa otro número ficticio
                      de 9 dígitos. Celular ficticio: 3000000000.
                    </p>
                  </details>
                )}
                {duplicate !== "none" && !allowDuplicate && (
                  <div className="form-notice mt-6">
                    <h2 className="font-semibold">
                      Ya hay un proceso anterior
                    </h2>
                    <p className="mt-2">{duplicateText[duplicate]}</p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            if (config.demo) {
                              const s = await api<BookingView>(
                                "demo-existing",
                                {},
                              );
                              setView(s);
                              setRescheduling(duplicate === "expirado");
                            } else {
                              const r = await api<{ url: string }>(
                                "continue",
                                {},
                              );
                              window.location.assign(r.url);
                            }
                          })
                        }
                      >
                        {duplicate === "expirado"
                          ? "Gestionar fecha anterior"
                          : "Continuar proceso anterior"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            await api("allow-new", {});
                            setAllowDuplicate(true);
                            setStep(1);
                          })
                        }
                      >
                        Solicitar una nueva atención
                      </button>
                    </div>
                    <p className="text-xs mt-3">
                      Crear otra atención es una decisión explícita; no
                      reemplaza la solicitud anterior.
                    </p>
                  </div>
                )}
              </>
            )}
            {step === 1 && (
              <>
                <div className="grid sm:grid-cols-2 gap-x-5">
                  {field("firstName", "Primer nombre", {
                    autoComplete: "given-name",
                    max: 60,
                  })}

                  {field("lastName", "Primer apellido", {
                    autoComplete: "family-name",
                    max: 60,
                  })}

                  {field("phone", "Celular colombiano", {
                    type: "tel",
                    inputMode: "tel",
                    autoComplete: "tel-national",
                    max: 10,
                  })}
                  <div className="form-field">
                    <label htmlFor="city">Ciudad de residencia</label>
                    <select
                      id="city"
                      value={
                        otherCity ||
                        (patient.city && !cities.includes(patient.city))
                          ? "other"
                          : patient.city
                      }
                      onChange={(e) => {
                        setOtherCity(e.target.value === "other");
                        change(
                          "city",
                          e.target.value === "other" ? "" : e.target.value,
                        );
                      }}
                      aria-invalid={!!errors.city}
                      aria-describedby="city-error"
                    >
                      <option value="">Seleccionar ciudad</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="other">Otra ciudad o municipio</option>
                    </select>
                    <span id="city-error" className="field-error">
                      {errors.city}
                    </span>
                    {(otherCity ||
                      (patient.city && !cities.includes(patient.city))) && (
                      <>
                        <label htmlFor="other-city">
                          Escribe tu ciudad o municipio
                        </label>
                        <input
                          id="other-city"
                          value={patient.city}
                          maxLength={80}
                          onChange={(e) => change("city", e.target.value)}
                          aria-invalid={!!errors.city}
                          aria-describedby="city-error"
                        />
                      </>
                    )}
                  </div>
                </div>
                <details
                  className="optional-details"
                  open={
                    patient.middleName ||
                    patient.secondLastName ||
                    errors.middleName ||
                    errors.secondLastName
                      ? true
                      : undefined
                  }
                >
                  <summary>
                    Agregar segundo nombre o segundo apellido{" "}
                    <span className="text-muted">· opcional</span>
                  </summary>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    {field("middleName", "Segundo nombre", {
                      optional: true,
                      max: 60,
                    })}
                    {field("secondLastName", "Segundo apellido", {
                      optional: true,
                      max: 60,
                    })}
                  </div>
                </details>
                <fieldset className="mt-3">
                  <legend className="font-semibold mb-3">
                    ¿A nombre de quién solicitas la cita?
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    {(["particular", "empresa"] as const).map((v) => (
                      <label
                        className={`choice ${patient.account === v ? "selected" : ""}`}
                        key={v}
                      >
                        <input
                          className="mr-2"
                          type="radio"
                          name="account"
                          checked={patient.account === v}
                          onChange={() => change("account", v)}
                        />
                        {v === "particular" ? "Particular" : "Empresa"}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {patient.account === "empresa" && (
                  <div className="mt-5">
                    {field("company", "Nombre de la empresa", {
                      autoComplete: "organization",
                    })}
                    <p className="text-sm text-muted mb-4">
                      Esta solicitud es para una persona. Para cotizaciones y
                      grupos visita{" "}
                      <Link href="/empresas" className="underline">
                        atención empresarial
                      </Link>
                      .
                    </p>
                  </div>
                )}
                <details
                  className="optional-details"
                  open={patient.job || errors.job ? true : undefined}
                >
                  <summary>
                    Agregar cargo <span className="text-muted">· opcional</span>
                  </summary>
                  <div className="mt-3">
                    {field("job", "Cargo", { optional: true, max: 100 })}
                  </div>
                </details>
              </>
            )}
            {step === 2 && (
              <>
                <div className="space-y-3">
                  {exams.map((e) => (
                    <label
                      key={e.id}
                      className={`choice flex items-start justify-start gap-3 ${patient.exams.includes(e.id) ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={patient.exams.includes(e.id)}
                        disabled={e.id === "osteomuscular"}
                        onChange={(ev) =>
                          change(
                            "exams",
                            ev.target.checked
                              ? [...patient.exams, e.id]
                              : patient.exams.filter((id) => id !== e.id),
                          )
                        }
                      />
                      <span>
                        <strong className="block">{e.label}</strong>
                        <span className="text-sm text-muted">
                          {e.id === "osteomuscular"
                            ? "Siempre incluido · examen base"
                            : "Opcional · tu total queda en $52.000"}
                        </span>
                      </span>
                      <span className="service-price">
                        {e.id === "osteomuscular"
                          ? formatCOP(43000)
                          : "Total " + formatCOP(52000)}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="field-error">{errors.exams}</p>
                <PriceTotal amount={total} />
                <div className="form-notice mt-5">
                  El examen médico está incluido. Si añades uno o los dos
                  servicios adicionales, el total es $52.000. Selecciona los que
                  necesitas.
                </div>
              </>
            )}
            {step === 3 && dateSelector}
            {step === 4 && (
              <>
                <dl className="review-list">
                  <div>
                    <dt>Paciente</dt>
                    <dd>
                      {[
                        patient.firstName,
                        patient.middleName,
                        patient.lastName,
                        patient.secondLastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </dd>
                  </div>
                  <div>
                    <dt>Documento</dt>
                    <dd>
                      {patient.documentType} {patient.document}
                    </dd>
                  </div>
                  <div>
                    <dt>Celular</dt>
                    <dd>{patient.phone}</dd>
                  </div>
                  <div>
                    <dt>Solicitud</dt>
                    <dd>
                      {patient.account === "empresa"
                        ? patient.company
                        : "Particular"}{" "}
                      · {patient.city}
                    </dd>
                  </div>
                  <div>
                    <dt>Servicios</dt>
                    <dd>
                      {exams
                        .filter((e) => patient.exams.includes(e.id))
                        .map((e) => e.label)
                        .join(", ")}
                    </dd>
                  </div>
                  <div>
                    <dt>Cita virtual</dt>
                    <dd>
                      {patient.date} · {patient.time} (Colombia)
                    </dd>
                  </div>
                  <div>
                    <dt>Pago</dt>
                    <dd>
                      {config.demo
                        ? "Sin cobro: demostración"
                        : config.paymentPolicy === "required"
                          ? "Pago con Wompi después de registrar la cita"
                          : config.paymentPolicy === "order-only"
                            ? "Transferencia · validación por VIP"
                            : "Configuración comercial pendiente"}
                    </dd>
                  </div>
                </dl>
                <PriceTotal amount={total} />
                <label className="check-row mt-6">
                  <input
                    type="checkbox"
                    checked={reviewed}
                    onChange={(e) => setReviewed(e.target.checked)}
                  />
                  <span>
                    Verifiqué mi documento, celular, servicios y horario.
                  </span>
                </label>
                {!config.demo &&
                  (!config.writesEnabled ||
                    config.paymentPolicy === "unconfigured") && (
                    <p className="form-alert mt-4">
                      Estamos preparando la confirmación en línea. Puedes
                      guardar tu solicitud y consultar con VIP.
                    </p>
                  )}
              </>
            )}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-border">
              <button
                type="button"
                className="btn-secondary"
                disabled={busy}
                onClick={() =>
                  step === 0 ? setStarted(false) : setStep((s) => s - 1)
                }
              >
                ← {step === 0 ? "Información del servicio" : "Anterior"}
              </button>
              <button
                className="btn-primary"
                disabled={
                  busy ||
                  slotsLoading ||
                  (step === 4 && !reviewed) ||
                  (step === 0 && duplicate !== "none" && !allowDuplicate)
                }
              >
                {busy
                  ? "Procesando…"
                  : step === 4
                    ? "Confirmar solicitud"
                    : "Continuar →"}
              </button>
            </div>
            <p className="text-xs text-muted mt-4" role="status">
              {saved ||
                "Tus datos personales no se guardan en el navegador; solo conservamos un identificador temporal de sesión en esta pestaña."}
            </p>
            {step === 4 && <PaymentOptions amount={total} showTotal={false} />}
          </form>
        </section>
      )}
      <p className="text-center text-xs text-muted mt-7">
        VIP Salud Ocupacional · Tu información se usa para gestionar esta
        solicitud.
        {" "}
        <a href={config?.privacyUrl || PRIVACY_PATH} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-accent-strong">Política de privacidad y tratamiento de datos</a>
      </p>
    </div>
  );
}
