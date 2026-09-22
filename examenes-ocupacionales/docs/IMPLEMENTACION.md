# Implementación: frontend estático + backend Render

## Separación realizada

La aplicación quedó dividida en dos superficies:

| Componente | Ubicación | Alojamiento | Responsabilidad |
| --- | --- | --- | --- |
| Frontend | `examenes-ocupacionales/` | GitHub Pages | UI, formulario, validaciones del navegador y navegación |
| Backend | `backend/` | Render | API, sesiones, SQLite cifrado, Mediconecta y Wompi |

El frontend usa `NEXT_PUBLIC_API_URL` para llamar por HTTPS al backend. El backend aplica CORS a los orígenes listados en `ALLOWED_ORIGINS`.

## Sesiones entre dominios

Se eliminó la dependencia de cookies cross-site. El backend genera un token aleatorio de 256 bits, guarda únicamente su hash y lo devuelve al frontend al crear la sesión. El navegador conserva ese token en `sessionStorage` y lo envía como:

```http
Authorization: Bearer <token>
```

Los datos personales no se guardan en `sessionStorage`; permanecen cifrados en SQLite mediante AES-256-GCM. La sesión conserva la expiración de 24 horas del diseño original.

## API

Rutas públicas del backend:

- `GET /health`
- `GET /api/booking/config`
- `POST /api/booking/session`
- `GET /api/booking/status`
- `POST /api/booking/draft`
- `POST /api/booking/duplicate`
- `POST /api/booking/availability`
- `POST /api/booking/confirm`
- `POST /api/booking/reconcile`
- `POST /api/booking/allow-new`
- `POST /api/booking/demo-existing`
- `POST /api/booking/reschedule`
- `POST /api/booking/checkout`
- `POST /api/booking/abandon-payment`
- `POST /api/booking/continue`
- `POST /api/booking/new-session`
- `POST /api/booking/wompi-events`

Salvo `config`, `session`, `health` y el webhook, las rutas requieren el token de sesión.

## CORS

Ejemplo de Render:

```env
FRONTEND_ORIGIN=https://vipexamenesocupacionales.com
ALLOWED_ORIGINS=https://vipexamenesocupacionales.com,https://www.vipexamenesocupacionales.com,https://dtalero78.github.io
```

`FRONTEND_ORIGIN` se usa también para el retorno de Wompi. `ALLOWED_ORIGINS` puede incluir varios orígenes separados por comas; no incluye rutas.

## GitHub Pages

`next.config.ts` usa:

```ts
output: "export"
trailingSlash: true
images: { unoptimized: true }
```

Por tanto no se ejecutan API routes de Next.js en GitHub Pages. El workflow construye el frontend, sube `examenes-ocupacionales/out` como Pages artifact y despliega solo si frontend y backend pasan verificación.

Antes del primer despliegue, crear la variable del repositorio:

```text
NEXT_PUBLIC_API_URL=https://<servicio>.onrender.com
```

## Render y persistencia

Para prueba puede usarse almacenamiento efímero. Para producción se recomienda una sola instancia con Persistent Disk y:

```env
DATA_DIR=/var/data/vip
```

Mantener `DATA_ENCRYPTION_KEY` fuera del repositorio. Debe tener 64 caracteres hexadecimales. No rotarla sin un procedimiento de migración porque cifra los datos persistidos.

## Mediconecta

Modo de prueba seguro:

```env
NODE_ENV=production
MEDICONNECTA_MODE=mock
ENABLE_DEMO=true
MEDICONNECTA_WRITES_ENABLED=false
```

Modo real, después de validar el contrato:

```env
MEDICONNECTA_MODE=live
ENABLE_DEMO=false
MEDICONNECTA_BASE_URL=https://...
MEDICONNECTA_TENANT=ipsVip
MEDICONNECTA_WRITES_ENABLED=true
PAYMENT_POLICY=order-only
```

No activar `MEDICONNECTA_WRITES_ENABLED=true` hasta comprobar configuración, disponibilidad y duplicados con el proveedor.

## Wompi

El webhook continúa en:

```text
POST https://<backend-render>/api/booking/wompi-events
```

La redirección del checkout regresa a:

```text
<FRONTEND_ORIGIN>/examenes-virtuales/resultado/
```

Una redirección nunca acredita el pago; el backend conserva la verificación server-side del evento y la lectura posterior de la transacción.

## Archivos privados que no deben subirse

- `.env*` excepto `.env.example`
- `.data*`
- `*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal`
- `node_modules/`
- `.next/`, `out/`, `dist/`
- `*.tsbuildinfo`
