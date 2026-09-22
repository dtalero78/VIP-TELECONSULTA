"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./VideoTutorial.module.css";

export function VideoTutorial() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const triggerButton = trigger.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      triggerButton?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={trigger} type="button" className={styles.trigger} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className={styles.play} aria-hidden="true">▶</span>
        <span><strong>¿Es tu primera vez?</strong><span className={styles.description}>Te mostramos cómo agendar</span><span className={styles.action}>Ver tutorial · 3 minutos</span></span>
      </button>
      {open && createPortal(
        <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
          onCancel={() => setOpen(false)} onClose={() => setOpen(false)}
          onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className={styles.header}>
            <h2 id={titleId}>Cómo agendar tu cita virtual</h2>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Cerrar tutorial" autoFocus>×</button>
          </div>
          <iframe className={styles.video} src="https://www.youtube-nocookie.com/embed/HFU-4Otea9g?playsinline=1"
            title="Tutorial: cómo agendar tu cita virtual en VIP Salud Ocupacional"
            allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          <p className={styles.footer}>Sigue el paso a paso a tu ritmo. <a href="https://www.youtube.com/watch?v=HFU-4Otea9g" target="_blank" rel="noopener noreferrer">Ver en YouTube ↗</a></p>
        </dialog>, document.body
      )}
    </>
  );
}
