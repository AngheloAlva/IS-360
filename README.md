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
