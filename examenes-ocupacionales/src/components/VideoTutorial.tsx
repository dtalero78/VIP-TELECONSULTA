"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./VideoTutorial.module.css";

export function VideoTutorial({ variant = "booking", confirmationId }: { variant?: "booking" | "next"; confirmationId?: string }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const next = variant === "next";
  const title = next ? "Tu cita está registrada: ¿qué sigue ahora?" : "Cómo agendar tu cita virtual";
  const videoId = next ? "ZezYJZa9ueI" : "oVFi7q1aPw8";

  useEffect(() => {
    if (!next || !confirmationId) return;
    const timer = window.setTimeout(() => {
      try {
        const key = `vip-next-video:${confirmationId}`;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "shown");
      } catch { /* The tutorial also works without browser storage. */ }
      setOpen(true);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [next, confirmationId]);

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const triggerButton = trigger.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      triggerButton?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button ref={trigger} type="button" className={styles.trigger} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className={styles.play} aria-hidden="true">▶</span>
        <span><strong>{next ? "¿Qué debes hacer ahora?" : "¿Es tu primera vez?"}</strong><span className={styles.description}>{next ? "Este video te explica los pasos para continuar con tu atención." : "Te mostramos cómo agendar"}</span><span className={styles.action}>Ver tutorial · 1 min 30 s</span></span>
      </button>
      {open && createPortal(
        <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
          onCancel={() => setOpen(false)} onClose={() => setOpen(false)}
          onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className={styles.header}>
            <h2 id={titleId}>{title}</h2>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Cerrar tutorial" autoFocus>Cerrar ×</button>
          </div>
          <iframe className={styles.video} src={`https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          <p className={styles.footer}>Puedes cerrar esta ventana y volver a ver el video cuando lo necesites. <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Ver en YouTube ↗</a></p>
        </dialog>, document.body
      )}
    </>
  );
}
