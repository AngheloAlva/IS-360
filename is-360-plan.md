# IS 360 — Plan de Implementación

> Demo fork del proyecto OTC. Producto: sistema de gestión de mantenimiento industrial (CMMS) genérico para mostrar a empresas potenciales clientes.

---

## 1. Contexto y motivación

### El problema
- El proyecto OTC original es de un cliente real (Oleotransandino). No es ético ni legalmente seguro andar mostrando ese código/repo a otras empresas.
- Se necesita una versión **demo** que:
  - Sea visualmente distinta (branding propio: IS 360)
  - Funcione 100% local en el browser, sin BD remota
  - Permita al usuario crear/editar/persistir datos durante la sesión
  - No dependa de mantenerse al día con el OTC original (es un artefacto de venta, no un producto vivo)

### Intento previo descartado
- Ya se probó hacer un fork con BD en Neon y **no funcionó bien**. Por eso esta vez vamos 100% local.

---

## 2. Decisiones arquitectónicas tomadas

### 2.1 Estrategia general
- **Repo NUEVO desde cero** (no fork de GitHub). `git init` limpio, sin historia del cliente.
- **Path destino**: `/Users/anghelo/Dev/demos/is-360/` (path real, plural)
- Se copia el código del OTC actual y se va adaptando.

### 2.2 Stack de datos: PGlite + MSW (solo lectura) + funciones client (escritura)

**El problema técnico real**:
- ~100 páginas client-side con hooks tipo `useWorkOrders()` que pegan a `/api/work-orders` via React Query (lecturas)
- ~119 API routes que usan Prisma (solo GETs)
- **245 server actions** (en 221 archivos) que usan Prisma (creates/updates/deletes)
- 12 páginas RSC que usan Prisma directo

**La solución elegida** — DOS rutas distintas según operación:

```
┌─ LECTURAS (GETs) ───────────────────┐  ┌─ ESCRITURAS (writes) ──────────────┐
│  Component                          │  │  Component                         │
│    ↓ useQuery → fetch('/api/...')   │  │    ↓ useMutation → action(data)    │
│  MSW intercepta el fetch            │  │  Función client (ex-server-action) │
│    ↓                                │  │    ↓                               │
│  PGlite                             │  │  PGlite                            │
│    ↓ Postgres en IndexedDB          │  │    ↓ Postgres en IndexedDB         │
└─────────────────────────────────────┘  └────────────────────────────────────┘
```

- **PGlite** (`@electric-sql/pglite`): Postgres compilado a WebAssembly que corre en el browser. Persiste en IndexedDB. ~3MB gzipped. Es Postgres REAL.
- **MSW (Mock Service Worker)**: intercepta `fetch()` antes de salir a la red. Solo para los GETs (API routes).
- **Funciones client**: cada server action se reescribe sacando `"use server"` y reemplazando el cuerpo para escribir directo a PGlite. La UI no se entera porque `useMutation` sigue llamando la misma función.

### 2.3 Por qué esta arquitectura

- **Cero refactor de componentes** que usan `useQuery` o `useMutation`: solo cambia lo que pasa "debajo".
- **Postgres real**: las queries SQL del backend actual son casi 1:1 portables a PGlite.
- **Vercel-compatible**: PGlite vive en el browser, NO en Vercel. Limitaciones de edge/serverless no aplican.
- **Offline-capable post-first-load**: una vez cargado el WASM, no necesita red.
- **Aislado por usuario**: cada visitante de la demo tiene SU propia BD en SU IndexedDB.
- **Server actions no se interceptan con MSW**: usan un protocolo RSC propio de Next, hacerlo es frágil y se rompe en cada update. Por eso van por la ruta de funciones client directas.

### 2.4 Limitaciones aceptadas
- PGlite es client-only → import dinámico con `ssr: false` obligatorio.
- Prisma no tiene adapter oficial para PGlite → **no usamos Prisma en la demo**, traducimos a SQL directo.
- Single connection (irrelevante para demo de un usuario).
- Algunas funciones server-side (emails, PDFs server-rendered, uploads) se mockean — ver §6.
- Headers COOP/COEP en Vercel: validar si la versión actual de PGlite los necesita.

### 2.5 Refactor por cada server action

Cada server action que se porta requiere:
1. **Sacar** `"use server"` del top del archivo
2. **Reemplazar** `prisma.x.y()` por SQL directo contra PGlite
3. **Borrar** `revalidatePath` / `revalidateTag` (lo cubre React Query con `invalidateQueries` en `onSuccess`)
4. **Mover** el `redirect()` al componente que llama (`router.push()` después del `mutate`)
5. **Reemplazar** `getServerSession()` por `getDemoUser()` que lee del `localStorage`
6. **Mockear o eliminar** envío de emails, generación de PDFs server-side, headers, cookies
7. **Cuidado con imports**: si el archivo tenía `import "server-only"`, se saca

**Confirmado**: no hay `<form action={serverAction}>` directo en RSC. Todos los writes pasan por `useMutation`, así que el frontend no se entera del cambio.

---

## 3. Alcance: páginas y módulos

### 3.1 Flujos HEADLINE (9 módulos + 3 subitems críticos)

Son los flujos que el vendedor recorre con el cliente. Tienen que estar 100% funcionales.

1. **Dashboard / Inicio** — KPIs en vivo, primera impresión
2. **Órdenes de Trabajo** + subitem **Indicadores**
3. **Permisos de Trabajo**
4. **Equipos + Ubicaciones** + subitem **Historial de Equipos**
5. **Planes de Mantenimiento** + subitem **Programación**
6. **Carpetas de Arranque**
7. **Control Laboral**
8. **Solicitudes de Trabajo**
9. **Soporte**

### 3.2 Flujos SECUNDARIOS

Se muestran si hay tiempo. Pueden tener funcionalidad básica o subset.

- Charlas de Seguridad (admin view)
- Empresas Contratistas + Usuarios
- Documentación (file management)
- Registro de Actividad
- Mi Cuenta (datos personales, todo lo de "cuenta")

### 3.3 Páginas/módulos a ELIMINAR

**Páginas de tokens públicos (3)** — flujos para visitantes externos:
- `src/app/(pages)/charla-de-visitas/[token]/page.tsx`
- `src/app/(pages)/evaluacion/[token]/page.tsx`
- `src/app/(pages)/acreditacion/[token]/page.tsx`

**Módulos completos**:
- Crons (5 endpoints) — no corren en browser
- API v1 (17 endpoints) — integración externa
- Reportabilidad / Reportabilidad-OTC — analítica pesada, costo/beneficio malo
- Tutoriales (placeholder estático)
- Solicitudes de Bloqueo / Lockout — muy nicho
- Libro de Obras — secundario, no se entiende en 5min
- 2FA / Cambio de password — auth está mockeada
- API Keys — solo integraciones
- PDFs server-side — botón con toast "no disponible en demo"

### 3.4 Páginas RSC a MIGRAR a Client (9)

- `dashboard/charlas-de-seguridad/page.tsx`
- `dashboard/charlas-de-seguridad/evaluacion/[category]/page.tsx`
- `dashboard/charlas-de-seguridad/visitas/page.tsx`
- `admin/dashboard/charlas-de-seguridad/evaluacion/[category]/page.tsx`
- `admin/dashboard/charlas-de-seguridad/visitas/page.tsx`
- `admin/dashboard/permisos-de-trabajo/[id]/page.tsx`
- `admin/dashboard/permisos-de-trabajo/agregar/page.tsx`
- `admin/dashboard/documentacion/[area]/page.tsx`
- `auth/login/page.tsx` → reemplazada por **selector de rol mock**

### 3.5 Páginas que NO requieren cambio (~100)

Ya son client components con hooks de React Query → solo MSW intercepta sus fetch.

---

## 4. Inventario de endpoints y server actions

### 4.1 API routes funcionales a implementar (~28 endpoints GET)

**Work Orders (5)** — `GET /api/work-order`, `GET /api/work-order/[id]/details`, `GET /api/work-order/[id]/summary`, `GET /api/work-order/stats`, `GET /api/work-order/with-inspections`

**Work Permits (5)** — `GET /api/work-permit`, `GET /api/work-permit/[id]`, `GET /api/work-permit/[id]/lockout-permits`, `GET /api/work-permit/stats`, `GET /api/work-permit/pdf/blank`

**Equipments (4)** — `GET /api/equipments`, `GET /api/equipments/[id]`, `GET /api/equipments/[id]/work-orders`, `GET /api/equipments/[id]/maintenance-plans`, `GET /api/equipments/[id]/timeline`

**Locations (1)** — `GET /api/locations`

**Maintenance Plans (4)** — `GET /api/maintenance-plan`, `GET /api/maintenance-plan/[planSlug]/stats`, `GET /api/maintenance-plan/[planSlug]/tasks`, `GET /api/maintenance-plan/schedule`, `GET /api/maintenance-plan/kpi`

**Dashboard (2)** — `GET /api/dashboard/homepage-stats`, `GET /api/dashboard/company-stats`

**Companies + Users (4)** — `GET /api/companies`, `GET /api/companies/[id]`, `GET /api/users`, `GET /api/me`

**Documents (3)** — `GET /api/documents`, `GET /api/documents/search`, `GET /api/document-management/tree`

### 4.2 API routes con stub genérico (~80 endpoints)

Un handler catch-all que devuelve `200 []` o `200 {}` según método/path. Si el cliente clickea algo no implementado, no rompe.

### 4.3 Server actions por módulo (con abstracción)

Cuenta original: **245 funciones / 221 archivos**.
Cuenta con abstracción aplicada: **~136 funciones**.

| Módulo | Originales | Real demo | Notas |
|--------|-----------|-----------|-------|
| startup-folder | 76 | ~16 | 7 tipos de carpeta con patrón duplicado → factory parametrizado |
| work-order | 33 | ~25 | Poca duplicación, casi 1:1 |
| safety-talk | 27 | ~18 | Algunas ops repetidas por categoría |
| labor-control | 20 | ~12 | Patrón parecido a folders |
| user | 16 | ~10 | Mucho relacionado a auth → simplificable |
| work-request | 10 | ~8 | |
| maintenance-plan | 9 | ~9 | |
| document | 8 | ~8 | |
| work-permit | 7 | ~7 | |
| support | 6 | ~6 | |
| location, company, equipment, vehicle | 15 | ~12 | |
| auth, worker-compliance, otros | 8 | ~5 | |
| **TOTAL** | **245** | **~136** | |

### 4.4 Patrón startup-folder (caso de mayor abstracción)

**7 tipos de carpeta** confirmados:
1. BasicFolder
2. VehicleFolder
3. WorkerFolder
4. SafetyAndHealthFolder
5. TechnicalSpecsFolder
6. EnvironmentFolder
7. EnvironmentalFolder

**Patrón duplicado** (basic/vehicle/worker tienen 9-10 ops idénticas):
- `createDocument`, `updateDocument`, `updateExpirationDate`, `updateToUpdate`
- `undoDocumentReview`, `getEntities`, `linkEntity`, `getFolderDocuments`
- `submitFolderForReview`, `updateFolderConfig` (solo worker)

**Estrategia**:
```ts
const workerActions = createFolderActions("worker")
await workerActions.createDocument(data)
await workerActions.submitForReview(folderId)
```

Reemplaza ~28 actions con un factory + 1 función parametrizada.

**Cero código muerto detectado.** Todas las funciones tienen llamadores reales.

---

## 5. Casos especiales (no portan trivial)

### 5.1 Generación de PDFs (2 archivos)
- `safety-talk/actions/generate-certificate.ts`
- `safety-talk/actions/upload-certificate-to-startup-folders.ts`

**Estrategia demo**: botón "Descargar PDF" → toast "no disponible en demo". Alternativa: generar uno client-side con `jspdf` si querés mostrar la feature de certificado.

### 5.2 Envío de emails (27 archivos)
Concentrados en: work-order (10), work-request (4), labor-control (3), startup-folder (3), support (3), safety-talk (2), work-permit (1), user (1).

**Estrategia demo**: no-op + toast `"Email enviado: [destinatario]"` para que el cliente VEA que la feature existe sin tener que mandar email real.

### 5.3 Upload de archivos (4 archivos primarios)
- `document/actions/uploadMultipleFiles.ts`
- `work-order/actions/uploadWorkOrderAttachment.ts`
- `safety-talk/actions/upload-*.ts` (2 archivos)

**Estrategia demo**: guardar metadata en PGlite, archivo como Blob URL o en IndexedDB. Funciona, requiere wrapper específico.

### 5.4 Llamadas a APIs externas
**Ninguna detectada.** No hay integraciones HTTP a terceros que portar.

---

## 6. Plan de ejecución (iterativo por verticales)

NO se portan las 136 funciones upfront. Se va módulo por módulo con vertical completo: cada iteración termina con algo demostrable.

### Iteración 0 — Setup base
- [ ] **Paso 1**: Crear repo limpio (`git init`, copiar archivos sin `.git`/`node_modules`/`.next`/`.env*`, primer commit)
- [ ] **Paso 2**: Rebranding mínimo (`package.json` → `is-360`, logo placeholder, paleta, metadata)
- [ ] **Paso 3**: Limpieza de referencias al cliente (strings "Oleotransandino", "OTC", emails hardcodeados, seeds)
- [ ] **Paso 4**: Eliminar páginas/módulos descartados (§3.3) + sus API routes + hooks/componentes huérfanos
- [ ] **Paso 5**: Setup PGlite (`pnpm add @electric-sql/pglite`, `src/lib/demo-db/client.ts`, schema SQL desde Prisma, init function)
- [ ] **Paso 6**: Setup MSW (`pnpm add msw -D`, `init public/`, browser worker, handler base con catch-all 200 [])
- [ ] **Paso 9 (parcial)**: Mock auth con selector de rol + `useDemoUser()` hook que lee `localStorage`

### Iteración 1 — MVP visible: Work Orders end-to-end
- [ ] Implementar API GETs de work-order en MSW + PGlite
- [ ] Portar ~25 server actions de work-order a funciones client
- [ ] Validar flujo completo: listar → crear → ver detalle → cambiar estado → completar
- [ ] **Hito**: se puede mostrar el corazón del CMMS

### Iteración 2 — Permisos + Equipos + Ubicaciones
- [ ] Implementar GETs y portar actions de work-permit (7), equipments (12), locations (5)
- [ ] Incluir subitem Historial de Equipos
- [ ] **Hito**: tres módulos headline funcionando

### Iteración 3 — Planes + Solicitudes
- [ ] Maintenance plans (9 actions) + subitem Programación
- [ ] Work requests (8 actions)
- [ ] **Hito**: el WOW del scheduling automático

### Iteración 4 — Carpetas de Arranque
- [ ] Implementar factory `createFolderActions(type)` parametrizado
- [ ] Cubrir los 7 tipos de carpeta
- [ ] **Hito**: módulo más pesado completo con ~16 funciones (no 76)

### Iteración 5 — Control Laboral + Soporte
- [ ] Labor control (~12 actions con patrón parecido a folders)
- [ ] Support tickets (~6 actions)
- [ ] **Hito**: 9 módulos headline completos

### Iteración 6 — Secundarios + pulido
- [ ] Charlas de Seguridad (admin) — migrar 5 páginas RSC a client
- [ ] Empresas + Usuarios
- [ ] Documentación (con upload mockeado)
- [ ] Registro de Actividad
- [ ] Mi Cuenta (datos personales, sin 2FA ni cambio password)

### Iteración 7 — Seed + UX de demo + Deploy
- [ ] **Paso 10**: Seed inicial atractivo
  - Empresa ficticia: "Industrias Demo S.A."
  - 3-5 áreas/ubicaciones realistas
  - 15-25 equipos con jerarquía
  - 30-50 OTs en distintos estados
  - 5-10 Permisos de Trabajo
  - Algunas Charlas y evaluaciones
  - 1-2 usuarios por rol
- [ ] **Paso 11**: UX demo
  - Botón "Resetear demo" visible
  - Banner "Estás en una demo — los datos no se guardan en servidor"
  - Loading bonito durante primer carga del WASM
  - Tour opcional para primer visitante (opcional)
- [ ] **Paso 12**: Deploy en Vercel
  - `NEXT_PUBLIC_DEMO_MODE=true`
  - Validar headers COOP/COEP
  - Dominio propio
  - Probar en Chrome / Firefox / Safari / Edge

---

## 7. Estimación

**3-4 semanas de laburo enfocado.**

Distribución aproximada:
- Iteración 0 (setup): 2-3 días
- Iteración 1 (work orders MVP): 4-5 días
- Iteración 2 (permisos + equipos + ubicaciones): 4-5 días
- Iteración 3 (planes + solicitudes): 3-4 días
- Iteración 4 (carpetas de arranque): 3-4 días
- Iteración 5 (control laboral + soporte): 2-3 días
- Iteración 6 (secundarios): 3-4 días
- Iteración 7 (seed + UX + deploy): 2-3 días

El paso 7 (porting de 136 funciones) es el grueso, pero se diluye en iteraciones verticales para tener feedback rápido y nunca quedar bloqueado más de una semana sin algo demostrable.

---

## 8. Convenciones del proyecto IS 360

- **Package manager**: pnpm (como en el OTC original)
- **Commits**: Conventional Commits sin atribución de IA
- **Idioma del código**: español para textos UI, inglés para identifiers
- **Estructura de directorios**: igual al OTC original al inicio
- **No comentarios redundantes**: el código se explica solo, solo se comenta el WHY no obvio
- **No backwards-compat shims**: si algo no se usa más, se borra (no es producto vivo)

---

## 9. Resumen ejecutivo

| Decisión | Resolución |
|----------|------------|
| Stack de datos | PGlite (browser Postgres) en IndexedDB |
| Lecturas (GETs) | API routes existentes → MSW intercepta → PGlite |
| Escrituras (writes) | Server actions → funciones client → PGlite directo |
| Auth | Mock con selector de rol en `localStorage` |
| Endpoints GET funcionales | ~28 (resto stub genérico) |
| Server actions a portar | ~136 (de 245 con abstracción) |
| Casos especiales | PDFs (stub), emails (toast), uploads (Blob URL) |
| Estrategia de ejecución | Iterativa por verticales, no upfront |
| Tiempo estimado | 3-4 semanas |
| Páginas RSC a migrar | 9 |
| Páginas eliminadas | 3 tokens + módulos completos (crons, v1, reportabilidad, etc.) |

---

## 10. Primer comando al arrancar la próxima sesión

Una vez confirmado este plan, la primera tarea concreta es **Iteración 0 — Pasos 1 + 2**: repo limpio con git init, rebranding mínimo aplicado, app corriendo en local. Eso da baseline funcional y motivación visible.

Pedile al asistente: **"Arranquemos con la Iteración 0: Paso 1 + 2 — git init limpio y rebranding mínimo."**
