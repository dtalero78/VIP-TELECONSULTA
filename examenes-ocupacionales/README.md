# Exámenes Ocupacionales — Bienestar y Salud Laboral S.A.S.

Landing page recreada con el contenido de [examenesocupacionales.com](https://www.examenesocupacionales.com)
y diseñada con el skill [tasteskill.dev](https://www.tasteskill.dev/) (`design-taste-frontend`).

## Stack

- **Next.js 16** (App Router, Server Components, prerender estático)
- **Tailwind v4** con tokens de tema (teal médico, light + dark vía `prefers-color-scheme`)
- **Motion** (`motion/react`) para reveals en scroll, con soporte de `prefers-reduced-motion`
- **Phosphor Icons** para iconografía

## Comandos

```bash
npm run dev     # servidor de desarrollo en http://localhost:3000
npm run build   # build de producción
npm start       # servir el build
```

## Estructura

- `src/app/layout.tsx` — metadata SEO en español, fuentes (Geist).
- `src/app/globals.css` — tokens de diseño (acento teal único, light/dark).
- `src/lib/site.ts` — datos del negocio (contacto, navegación, stats, cobertura).
- `src/components/*` — una sección por archivo (Header, Hero, Trayectoria, Servicios,
  TiposExamen, Especializados, Paraclinicos, Proceso, Equipo, Empresa, CtaContacto, Footer).

## ⚠️ Pendiente: imágenes definitivas

Las fotos actuales son de **Unsplash** (IDs verificados, definidos en `photos` dentro de
`src/lib/site.ts`). Son fotografía médica real y genérica; reemplázalas por fotos propias de la
IPS para máxima autenticidad:

- `photos.diagnostico` — imagen grande del hero.
- `photos.especialista` — retrato del equipo (sección Equipo).
- `photos.sede` — banner de instalaciones (sección Empresa).
- `photos.telemedicina` — atención virtual (sección Proceso).

Los logos de clientes en `src/lib/site.ts` se muestran como monogramas; sustitúyelos por los
logotipos SVG reales cuando estén disponibles.

> Datos de contacto, normatividad y servicios tomados del sitio original. Verifica las cifras de
> "Trayectoria" en `src/lib/site.ts` antes de publicar.
