# Backend VIP Teleconsulta

API Node.js diseñada para ejecutarse en Render. No sirve la interfaz web; esa parte permanece en GitHub Pages.

## Comandos

```bash
npm ci
npm run typecheck
npm test
npm run build
npm start
```

`GET /health` devuelve el estado básico del servicio.

## Variables

Copia `.env.example` únicamente para desarrollo local. En Render configura los valores en **Environment**. Nunca subas el `.env` real.

Para generar `DATA_ENCRYPTION_KEY`:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

La clave resultante tiene 64 caracteres hexadecimales.

## Producción

Para datos persistentes con SQLite usa una sola instancia y un Persistent Disk. Si luego se necesitan varias instancias, migra sesiones, locks y datos a una base compartida como PostgreSQL antes de escalar horizontalmente.
