# Frontend VIP Salud Ocupacional

Frontend Next.js/React preparado para exportación estática y publicación en GitHub Pages.

El navegador ya no llama a rutas `/api` internas. Todas las operaciones de agenda usan el backend externo definido en:

```env
NEXT_PUBLIC_API_URL=https://vip-teleconsulta-api.onrender.com
```

En GitHub Actions este valor se obtiene de la variable de repositorio `NEXT_PUBLIC_API_URL`.

## Desarrollo

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Verificación

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run build` genera `out/`, que es la carpeta publicada por GitHub Pages. `public/CNAME` conserva `vipexamenesocupacionales.com`.

El frontend no contiene claves privadas, SQLite ni credenciales de Mediconecta/Wompi. Solo conserva en `sessionStorage` un identificador temporal de sesión opaco para poder recuperar el flujo mientras la pestaña siga abierta.
