# Sistema de Gestión de Contratistas IS 360

## 🏢 Descripción del Proyecto

IS 360 es un sistema integral de gestión de contratistas diseñado para empresas industriales que necesitan administrar de manera eficiente:

- Órdenes de trabajo y libros de obras
- Permisos de trabajo y seguridad
- Solicitudes de trabajo
- Gestión documental y almacenamiento de archivos
- Carpetas de arranque
- Equipos y planes de mantenimiento
- Charlas de seguridad
- Empresas contratistas
- Vehículos y personal contratista
- Planes de mantenimiento y tareas

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 22+
- PostgreSQL
- pnpm
- Azure Storage Account

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd is-360

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar migraciones
pnpm migrate:dev

# Iniciar en desarrollo
pnpm dev
```

## 📚 Documentación

- [Arquitectura Técnica](./docs/ARCHITECTURE.md)
- [Tecnologías Utilizadas](./docs/TECHNOLOGIES.md)
- [Base de Datos](./docs/DATABASE.md)
- [API Reference](./docs/API.md)
- [Módulos del Sistema](./docs/MODULES.md)

## 🏗️ Arquitectura

El sistema está construido con una arquitectura moderna basada en:

- **Frontend**: Next.js 15 con App Router
- **Backend**: API Routes de Next.js
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Better Auth con 2FA
- **UI**: Shadcn UI + Tailwind CSS
- **Estado**: TanStack Query + Zustand

## 🔧 Scripts Disponibles

```bash
pnpm dev                    # Desarrollo con Turbopack
pnpm build                  # Construcción para producción
pnpm start                  # Iniciar en producción
pnpm migrate:dev            # Ejecutar migraciones
pnpm prisma:generate        # Generar cliente Prisma
pnpm prisma:studio          # Abrir Prisma Studio
pnpm db:push                # Sincronizar base de datos con Prisma
pnpm db:seed                # Poblar base de datos
```
