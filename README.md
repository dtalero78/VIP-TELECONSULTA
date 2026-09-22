# VIP TELECONSULTA — GitHub Pages + Render

El proyecto queda separado en dos servicios sin cambiar el dominio público actual:

- `examenes-ocupacionales/`: **frontend Next.js exportado como sitio estático**. GitHub Pages publica la carpeta `out/`.
- `backend/`: **API Node.js** para sesiones, SQLite cifrado, Mediconecta y Wompi. Render ejecuta este servicio.

Arquitectura:

```text
vipexamenesocupacionales.com / GitHub Pages
                  |
                  | HTTPS + Bearer de sesión temporal
                  v
        vip-teleconsulta-api.onrender.com
                  |
             Node.js + SQLite
                  |
        Mediconecta / Wompi
```

No se usan cookies entre dominios. El frontend conserva únicamente un identificador opaco de sesión en `sessionStorage`; los datos personales se cifran y permanecen en el backend.

## Orden seguro para publicar

1. Sube este repositorio a `main` **sin archivos `.env`, SQLite, `.next` ni `node_modules`**.
2. Crea el backend en Render usando `render.yaml` o configurando `backend/` como Root Directory.
3. Obtén la URL HTTPS de Render, por ejemplo `https://vip-teleconsulta-api.onrender.com`.
4. En GitHub crea la variable de repositorio `NEXT_PUBLIC_API_URL` con esa URL exacta.
5. En **Settings > Pages**, selecciona **GitHub Actions** como Source.
6. Ejecuta/reintenta el workflow `Verify and deploy VIP`.
7. Prueba el flujo completo en modo demo antes de activar Mediconecta real.

La variable de GitHub es obligatoria: el workflow se detiene antes de reemplazar el sitio si no existe, evitando publicar un frontend sin API.

## Render

Configuración mínima:

- Root Directory: `backend`
- Build Command: `npm ci --include=dev && npm run build`
- Start Command: `npm start`
- Health Check: `/health`
- Node: `22.17.0` o superior

Primero puede desplegarse en `MEDICONNECTA_MODE=mock` + `ENABLE_DEMO=true`. Para producción real, configura las variables descritas en `backend/.env.example` y cambia a `MEDICONNECTA_MODE=live` solo cuando Mediconecta esté validado.

### SQLite en Render

Sin Persistent Disk, el servicio puede funcionar para pruebas, pero la base SQLite puede perderse en reinicios o redespliegues. Para producción, adjunta un Persistent Disk y cambia `DATA_DIR` a una ruta dentro del disco, por ejemplo `/var/data/vip`.

`DATA_ENCRYPTION_KEY` debe ser una clave hexadecimal de 64 caracteres y debe conservarse. Si se cambia, los registros cifrados existentes dejan de ser recuperables.

## Desarrollo local

Backend:

```bash
cd backend
npm ci
cp .env.example .env
npm run dev
```

Frontend, en otra terminal:

```bash
cd examenes-ocupacionales
npm ci
# crear .env.local con NEXT_PUBLIC_API_URL=http://localhost:10000
npm run dev
```

Para desarrollo local el backend acepta HTTP únicamente para `localhost`; en producción exige HTTPS para los orígenes configurados.

## Seguridad

Nunca subir:

```text
.env
.env.local
.data/
*.sqlite*
node_modules/
.next/
out/
dist/
```

Las credenciales de Mediconecta, Wompi y `DATA_ENCRYPTION_KEY` pertenecen a **Render > Environment**, no a GitHub Pages.
