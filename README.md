# IS 360 — Demo CMMS

Demo de un sistema integral de gestión de mantenimiento industrial (CMMS) que corre **100% en el browser** usando PGlite (Postgres en WebAssembly) + MSW. Sin backend, sin base de datos remota.

> Este proyecto es un artefacto de venta. No es un producto vivo. Está diseñado para mostrarse a empresas potenciales clientes que necesiten un CMMS similar.

## Módulos

- Órdenes de trabajo + indicadores
- Permisos de trabajo
- Equipos, ubicaciones e historial
- Planes de mantenimiento y programación
- Carpetas de arranque
- Control laboral
- Solicitudes de trabajo
- Soporte
- Charlas de seguridad
- Empresas contratistas y usuarios
- Documentación
- Registro de actividad

## Stack

- **Frontend**: Next.js (App Router) + React 19
- **UI**: Shadcn UI + Tailwind CSS 4
- **Estado servidor**: TanStack Query
- **Base de datos (demo)**: PGlite (Postgres en IndexedDB del browser)
- **Mock de red**: MSW (intercepta GETs hacia las API routes)
- **Auth (demo)**: selector de rol mock persistido en localStorage

## Inicio rápido

```bash
pnpm install
pnpm dev
```

No requiere `.env`, ni base de datos local, ni servicios externos.

## Plan de implementación

Ver [is-360-plan.md](./is-360-plan.md) para el roadmap completo (iteraciones, alcance, server actions a portar, casos especiales).

## Scripts

```bash
pnpm dev        # Desarrollo con Turbopack
pnpm build      # Build de producción
pnpm start      # Servir build
pnpm lint       # Lint
```

## Deploy (Vercel)

La demo está pensada para deployarse sin backend:

1. Importar el repo en Vercel.
2. Setear una sola variable de entorno: `NEXT_PUBLIC_DEMO_MODE=true`.
3. **No** setear `DATABASE_URL` ni credenciales de auth/email/Azure — todo se mockea client-side.
4. Deploy.

El `vercel.json` ya incluye los headers necesarios para el service worker de MSW (`Service-Worker-Allowed: /`) y cache largo para los assets de PGlite (`/demo-db/schema.sql`, `/demo-db/seed.sql`).

> Las API routes (`src/app/api/**`) siguen existiendo en el bundle pero MSW las intercepta en el browser. Si por algún motivo un request alcanzara el servidor, devolvería 500 (Prisma sin DATABASE_URL) — eso es esperado y solo ocurriría si MSW no logra registrarse, en cuyo caso el `DemoModeProvider` lo detecta y muestra una pantalla de error explícita.

## Resetear la demo

Hay un botón flotante "Resetear demo" en la esquina inferior derecha que elimina toda la información local (IndexedDB) y vuelve a sembrar los datos iniciales. Útil cuando se modifica el seed o se quiere volver al estado base.
