"use client";
import { useState } from "react";
export function calendarDays(min: string, max: string) {
  const days: string[] = [];
  for (
    let d = new Date(`${min}T12:00:00Z`);
    d.toISOString().slice(0, 10) <= max;
    d.setUTCDate(d.getUTCDate() + 1)
  )
    days.push(d.toISOString().slice(0, 10));
  return days;
}
export function AppointmentPicker({
  date,
  time,
  min,
  max,
  slots,
  loading,
  error,
  dateError,
  timeError,
  onDate,
  onTime,
  onRetry,
}: {
  date: string;
  time: string;
  min: string;
  max: string;
  slots: string[];
  loading: boolean;
  error: string;
  dateError?: string;
  timeError?: string;
  onDate: (date: string) => void;
  onTime: (time: string) => void;
  onRetry: () => void;
}) {
  const [chosenMonth, setMonth] = useState(date.slice(0, 7) || min.slice(0, 7));
  const days = calendarDays(min, max),
    months = [...new Set(days.map((d) => d.slice(0, 7)))];
  const month = date ? date.slice(0, 7) : chosenMonth;
  const label = (d: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-CO", {
      ...opts,
      timeZone: "America/Bogota",
    }).format(new Date(`${d}T12:00:00-05:00`));
  return (
    <div className="appointment-picker">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-field">
          <label htmlFor="appointment-month">Mes</label>
          <select
            id="appointment-month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              onDate("");
            }}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {label(`${m}-01`, { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="date">Día</label>
          <select
            id="date"
            value={date}
            onChange={(e) => onDate(e.target.value)}
            aria-invalid={!!dateError}
            aria-describedby="date-error"
          >
            <option value="">Seleccionar día</option>
            {days
              .filter((d) => d.startsWith(month))
              .map((d) => (
                <option key={d} value={d}>
                  {d === min ? "Hoy · " : ""}
                  {label(d, { weekday: "long", day: "numeric" })}
                </option>
              ))}
          </select>
        </div>
      </div>
      <p id="date-error" className="field-error">
        {dateError}
      </p>
      <div className="form-field mt-3">
        <label htmlFor="appointment-time">Hora · Colombia</label>
        <select
          id="appointment-time"
          value={slots.includes(time) ? time : ""}
          disabled={!date || loading || !slots.length}
          onChange={(e) => onTime(e.target.value)}
          aria-invalid={!!timeError}
          aria-describedby="time-error"
        >
          <option value="">
            {loading ? "Consultando agenda…" : "Seleccionar hora"}
          </option>
          {slots.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <p id="time-error" className="field-error">
          {timeError}
        </p>
      </div>
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="btn-secondary mt-2"
            onClick={onRetry}
          >
            Volver a consultar
          </button>
        </div>
      ) : (
        <p role="status" className="text-sm text-muted">
          {!date
            ? "Elige el día para consultar la agenda de VIP."
            : loading
              ? "Buscando horarios disponibles…"
              : slots.length
                ? `${slots.length} horarios disponibles para este día.`
                : "No hay horarios disponibles. Selecciona otro día."}
        </p>
      )}
      {date && time && slots.includes(time) && (
        <div className="appointment-selection">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>
              {label(date, { weekday: "long", day: "numeric", month: "long" })}
            </strong>
            <p>{time} · Hora de Colombia</p>
          </div>
        </div>
      )}
    </div>
  );
}
