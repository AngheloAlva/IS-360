# Referencia de API - Sistema IS 360

## 🔗 Visión General de la API

El sistema IS 360 utiliza APIs RESTful construidas con Next.js App Router, proporcionando endpoints seguros y eficientes para todas las operaciones del sistema.

### Características Generales

- **Autenticación**: Bearer token con Better Auth
- **Formato**: JSON para requests y responses
- **Paginación**: Estándar con `page` y `limit`
- **Filtrado**: Query parameters para búsqueda y filtros
- **Ordenamiento**: Parámetros `order` y `orderBy`
- **Validación**: Schemas con Zod
- **Rate Limiting**: Implementado para prevenir abuso

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante session cookies o Bearer token.

### Headers Requeridos

```http
Content-Type: application/json
Cookie: better-auth.session_token=<token>
```

### Respuestas de Error de Autenticación

```json
{
  "error": "No autorizado",
  "status": 401
}
```

## 📋 Endpoints Principales

### 🏢 Empresas (Companies)

#### GET /api/companies

Obtiene lista paginada de empresas activas.

**Query Parameters:**

- `page` (number): Página actual (default: 1)
- `limit` (number): Elementos por página (default: 10)
- `search` (string): Búsqueda por nombre o RUT
- `order` ("asc" | "desc"): Orden de resultados
- `orderBy` ("name" | "createdAt"): Campo de ordenamiento

**Response:**

```json
{
  "companies": [
    {
      "id": "string",
      "rut": "string",
      "name": "string",
      "image": "string",
      "createdBy": {
        "id": "string",
        "name": "string"
      },
      "createdAt": "datetime"
    }
  ],
  "total": "number",
  "totalPages": "number",
  "currentPage": "number"
}
```

#### POST /api/companies

Crea una nueva empresa.

**Request Body:**

```json
{
  "name": "string",
  "rut": "string",
  "startupFolderType": "STANDARD | CUSTOM",
  "startupFolderName": "string?",
  "vehicles": [
    {
      "plate": "string",
      "model": "string",
      "year": "string",
      "brand": "string",
      "type": "CAR | TRUCK | MOTORCYCLE | VAN",
      "color": "string?",
      "isMain": "boolean?"
    }
  ],
  "supervisors": [
    {
      "name": "string",
      "email": "string",
      "rut": "string",
      "phone": "string?",
      "internalArea": "string?",
      "internalRole": "string?"
    }
  ]
}
```

### 🔧 Órdenes de Trabajo (Work Orders)

#### GET /api/work-order

Obtiene lista paginada de órdenes de trabajo.

**Query Parameters:**

- `page`, `limit`, `search`, `order`, `orderBy`: Parámetros estándar
- `typeFilter` (string): Filtro por tipo de orden
- `statusFilter` (string): Filtro por estado
- `priorityFilter` (string): Filtro por prioridad
- `companyId` (string): Filtro por empresa
- `startDate`, `endDate` (string): Rango de fechas
- `permitFilter` (boolean): Solo órdenes con permisos
- `isOtcMember` (boolean): Solo miembros IS 360
- `onlyWithRequestClousure` (boolean): Solo con solicitud de cierre

**Response:**

```json
{
  "workOrders": [
    {
      "id": "string",
      "otNumber": "string",
      "type": "PREVENTIVE | CORRECTIVE | PREDICTIVE",
      "status": "PLANNED | IN_PROGRESS | COMPLETED | CANCELLED",
      "priority": "LOW | MEDIUM | HIGH | CRITICAL",
      "workDescription": "string",
      "estimatedHours": "number",
      "estimatedDays": "number",
      "company": {
        "id": "string",
        "name": "string"
      },
      "responsible": {
        "id": "string",
        "name": "string"
      }
    }
  ],
  "total": "number",
  "totalPages": "number"
}
```

#### POST /api/work-order

Crea una nueva orden de trabajo.

**Request Body:**

```json
{
  "type": "PREVENTIVE | CORRECTIVE | PREDICTIVE",
  "solicitationDate": "date",
  "solicitationTime": "string",
  "workRequest": "string",
  "workDescription": "string?",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "capex": "YES | NO",
  "equipment": ["string"],
  "programDate": "date",
  "estimatedHours": "string",
  "estimatedDays": "string",
  "estimatedEndDate": "date?",
  "companyId": "string?",
  "supervisorId": "string",
  "responsibleId": "string",
  "file": ["FileObject?"]
}
```

### 👥 Usuarios (Users)

#### GET /api/users

Obtiene lista de usuarios administradores.

**Query Parameters:**

- `page`, `limit`, `search`, `order`, `orderBy`: Parámetros estándar
- `showOnlyInternal` (boolean): Solo usuarios internos

**Response:**

```json
{
  "users": [
    {
      "id": "string",
      "rut": "string",
      "name": "string",
      "email": "string",
      "phone": "string?",
      "accessRole": "ADMIN | USER | PARTNER_COMPANY",
      "isActive": "boolean",
      "internal": "boolean",
      "company": {
        "id": "string",
        "name": "string"
      }
    }
  ],
  "total": "number",
  "totalPages": "number"
}
```

### 🛡️ Permisos de Trabajo (Work Permits)

#### GET /api/work-permit

Obtiene lista de permisos de trabajo.

#### POST /api/work-permit

Crea un nuevo permiso de trabajo.

**Request Body:**

```json
{
  "number": "string",
  "type": "HOT_WORK | CONFINED_SPACE | HEIGHT_WORK | ELECTRICAL",
  "startDate": "datetime",
  "endDate": "datetime",
  "workDescription": "string",
  "location": "string",
  "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
  "companyId": "string",
  "workOrderId": "string?",
  "preventionOfficerId": "string",
  "participants": ["string"]
}
```

### 🔧 Equipos (Equipment)

#### GET /api/equipments

Obtiene lista de equipos.

#### POST /api/equipments

Crea un nuevo equipo.

**Request Body:**

```json
{
  "barcode": "string",
  "tag": "string",
  "name": "string",
  "description": "string?",
  "location": "string",
  "type": "string?",
  "criticality": "LOW | MEDIUM | HIGH | CRITICAL",
  "parentId": "string?",
  "imageUrl": "string?"
}
```

### 🚗 Vehículos (Vehicles)

#### GET /api/vehicles

Obtiene lista de vehículos.

#### POST /api/vehicles

Registra un nuevo vehículo.

### 📊 Charlas de Seguridad (Safety Talks)

#### GET /api/safety-talks

Obtiene lista de charlas de seguridad.

#### POST /api/safety-talks

Crea una nueva charla de seguridad.

### 📁 Gestión de Documentos

#### GET /api/documents

Obtiene lista de documentos.

#### POST /api/file

Sube archivos al sistema.

**Request:** Multipart form data

**Response:**

```json
{
  "url": "string",
  "filename": "string",
  "size": "number",
  "type": "string"
}
```

### 📈 Analytics y Estadísticas

#### GET /api/analytics/query

Obtiene datos analíticos del sistema.

#### GET /api/dashboard/stats

Obtiene estadísticas del dashboard.

**Response:**

```json
{
  "totalWorkOrders": "number",
  "activeCompanies": "number",
  "pendingPermits": "number",
  "completedTasks": "number",
  "monthlyStats": {
    "workOrders": "number",
    "permits": "number",
    "maintenance": "number"
  }
}
```

## 🔄 Códigos de Estado HTTP

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Solicitud inválida (errores de validación)
- **401**: No autorizado
- **403**: Prohibido (permisos insuficientes)
- **404**: Recurso no encontrado
- **422**: Entidad no procesable (errores de negocio)
- **500**: Error interno del servidor

## 📝 Formato de Errores

```json
{
  "error": "string",
  "message": "string",
  "details": {
    "field": ["error messages"]
  },
  "timestamp": "datetime",
  "path": "string"
}
```

## 🔒 Permisos y Roles

### Roles de Usuario

- **ADMIN**: Acceso completo al sistema
- **USER**: Acceso limitado según módulos asignados
- **PARTNER_COMPANY**: Acceso a funcionalidades de empresa contratista

### Módulos Disponibles

- `WORK_ORDER`: Órdenes de trabajo
- `WORK_PERMIT`: Permisos de trabajo
- `EQUIPMENT`: Gestión de equipos
- `MAINTENANCE_PLAN`: Planes de mantenimiento
- `SAFETY_TALK`: Charlas de seguridad
- `DOCUMENT`: Gestión documental
- `VEHICLE`: Gestión de vehículos
- `WORK_REQUEST`: Solicitudes de trabajo
- `STARTUP_FOLDER`: Carpetas de arranque

## 🚀 Rate Limiting

- **Límite general**: 100 requests por minuto por IP
- **Límite de autenticación**: 5 intentos por minuto
- **Límite de subida de archivos**: 10 archivos por minuto

## 📱 Webhooks y Notificaciones

El sistema utiliza Pusher para notificaciones en tiempo real:

### Eventos Disponibles

- `work-order.created`
- `work-order.updated`
- `work-permit.approved`
- `maintenance.due`
- `safety-talk.completed`

### Formato de Webhook

```json
{
  "event": "string",
  "data": "object",
  "timestamp": "datetime",
  "userId": "string"
}
```
