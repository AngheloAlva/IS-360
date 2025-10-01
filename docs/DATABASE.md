# Base de Datos - Sistema IS 360

## 🗄️ Visión General

El sistema IS 360 utiliza **PostgreSQL** en un servidor en Azure como base de datos principal con **Prisma** como ORM. La base de datos está diseñada para manejar eficientemente:

- Gestión de usuarios y empresas
- Órdenes de trabajo y libros de obras
- Permisos de trabajo y seguridad
- Equipos y mantenimiento
- Documentación y archivos
- Notificaciones y actividad

### Relaciones Clave
- **User ↔ Company**: Muchos a uno
- **WorkOrder ↔ Equipment**: Muchos a muchos
- **WorkOrder ↔ WorkPermit**: Uno a muchos
- **User ↔ Notifications**: Uno a muchos

## 🏗️ Modelos Principales

### User (Usuario)
```prisma
model User {
  id               String    @id
  name             String
  email            String    @unique
  rut              String    @unique
  phone            String?
  accessRole       USER_ROLE @default(PARTNER_COMPANY)
  modules          MODULES[]
  area             AREAS?
  internalRole     String?
  internalArea     String?
  companyId        String?
  isSupervisor     Boolean?
  internal         Boolean   @default(false)
  isActive         Boolean   @default(true)
  banned           Boolean?
  banReason        String?
  banExpires       DateTime?
  documentAreas    AREAS[]   @default([])
  twoFactorEnabled Boolean?
  
  // Relaciones
  company          Company?  @relation(fields: [companyId], references: [id])
  sessions         Session[]
  workOrders       WorkOrder[] @relation("WorkOrderResponsible")
  workPermits      WorkPermit[] @relation("WorkPermitUser")
  notifications    Notification[]
  // ... más relaciones
}
```

### Company (Empresa)
```prisma
model Company {
  id       String  @id @default(cuid())
  name     String
  rut      String  @unique
  image    String?
  isActive Boolean @default(true)
  
  // Relaciones
  users          User[]
  workOrders     WorkOrder[]
  workPermits    WorkPermit[]
  vehicles       Vehicle[]
  startupFolders StartupFolder[]
  
  createdBy   User?   @relation("CompanyCreatedBy", fields: [createdById], references: [id])
  createdById String?
}
```

### WorkOrder (Orden de Trabajo)
```prisma
model WorkOrder {
  id                    String              @id @default(cuid())
  otNumber             String              @unique
  type                 WORK_ORDER_TYPE
  status               WORK_ORDER_STATUS   @default(PLANNED)
  priority             WORK_ORDER_PRIORITY
  solicitationDate     DateTime
  workDescription      String?
  estimatedHours       Float
  estimatedDays        Float
  programDate          DateTime
  estimatedEndDate     DateTime?
  progress   Float?              @default(0)
  
  // Relaciones
  company      Company?    @relation(fields: [companyId], references: [id])
  responsible  User        @relation("WorkOrderResponsible", fields: [responsibleId], references: [id])
  supervisor   User        @relation("WorkOrderSupervisor", fields: [supervisorId], references: [id])
  equipment    Equipment[]
  workPermits  WorkPermit[]
  milestones   Milestone[]
  workEntries  WorkEntry[]
}
```

### Equipment (Equipo)
```prisma
model Equipment {
  id            String       @id @default(cuid())
  barcode       String       @unique
  tag           String       @unique
  name          String
  description   String?
  location      String
  type          String?
  criticality   CRITICALITY?
  isOperational Boolean      @default(true)
  imageUrl      String?
  
  // Jerarquía
  parent     Equipment?  @relation("EquipmentHierarchy", fields: [parentId], references: [id])
  parentId   String?
  children   Equipment[] @relation("EquipmentHierarchy")
  
  // Relaciones
  workOrders          WorkOrder[]
  maintenancePlans    MaintenancePlan[]
  maintenanceTasks    MaintenancePlanTask[]
  attachments         Attachment[]
  history             EquipmentHistory[]
}
```

### WorkPermit (Permiso de Trabajo)
```prisma
model WorkPermit {
  id                String              @id @default(cuid())
  number            String              @unique
  type              WORK_PERMIT_TYPE
  status            WORK_PERMIT_STATUS  @default(PENDING)
  startDate         DateTime
  endDate           DateTime
  workDescription   String
  location          String
  riskLevel         RISK_LEVEL
  
  // Relaciones
  company           Company     @relation(fields: [companyId], references: [id])
  workOrder         WorkOrder?  @relation(fields: [workOrderId], references: [id])
  participants      User[]      @relation("WorkPermitParticipants")
  preventionOfficer User        @relation("PreventionOfficer", fields: [preventionOfficerId], references: [id])
  vehicles          Vehicle[]
  attachments       WorkPermitAttachment[]
}
```

## 🔢 Enumeraciones (Enums)

### Roles de Usuario
```prisma
enum USER_ROLE {
  USER
  ADMIN
  OPERATOR
  SUPERVISOR
  PARTNER_COMPANY
}
```

### Áreas de la Empresa
```prisma
enum AREAS {
  OPERATIONS                    // Operaciones
  INSTRUCTIONS                  // Instructivos
  INTEGRITY_AND_MAINTENANCE     // Integridad y Mantención
  ENVIRONMENT                   // Medio Ambiente
  OPERATIONAL_SAFETY            // Seguridad Operacional
  QUALITY_AND_OPERATIONAL_EXCELLENCE // Calidad y Excelencia Operacional
  REGULATORY_COMPLIANCE         // Cumplimiento Normativo
  LEGAL                        // Jurídica
  COMMUNITIES                  // Comunidades
  PROJECTS                     // Proyectos
  PURCHASING                   // Compras
  ADMINISTRATION_AND_FINANCES  // Administración y Finanzas
  IT                          // Informática
  GERENCY                     // Gerencia
  DOCUMENTARY_LIBRARY         // Biblioteca Documental
}
```

### Estados de Órdenes de Trabajo
```prisma
enum WORK_ORDER_STATUS {
  PLANNED
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  CLOSURE_REQUESTED
}
```

### Tipos de Órdenes de Trabajo
```prisma
enum WORK_ORDER_TYPE {
  CORRECTIVE   // Correctivo
  PREVENTIVE   // Preventivo
  PREDICTIVE   // Predictivo
  PROACTIVE    // Proactivo
}
```

### Criticidad de Equipos
```prisma
enum CRITICALITY {
  CRITICAL      // Crítico
  SEMICRITICAL  // Semicrítico
  UNCITICAL     // No crítico
}
```

## 📋 Índices y Optimizaciones

### Índices Principales
```prisma
// Usuario
@@index([email], name: "email_idx")
@@index([companyId], name: "company_id_idx")
@@index([accessRole, isActive], name: "access_role_is_active_idx")

// Orden de Trabajo
@@index([status], name: "status_idx")
@@index([otNumber], name: "ot_number_idx")
@@index([companyId, status], name: "company_status_idx")

// Empresa
@@index([rut], name: "rut_idx")
@@index([name], name: "name_idx")
@@index([isActive], name: "is_active_idx")

// Notificaciones
@@index([userId], name: "notification_user_id_idx")
@@index([isRead], name: "notification_is_read_idx")
@@index([targetRole], name: "notification_target_role_idx")
```


## 🛠️ Comandos de Base de Datos

### Desarrollo
```bash
# Ejecutar migraciones en desarrollo
pnpm migrate:dev

# Generar cliente Prisma
pnpm prisma:generate

# Abrir Prisma Studio
pnpm prisma:studio

# Poblar base de datos
pnpm db:seed

# Push cambios sin migración
pnpm db:push
```

### Producción
```bash
# Generar cliente para producción
pnpm prisma generate --no-engine

# Aplicar migraciones en producción
prisma migrate deploy
```

## 📊 Estadísticas de la Base de Datos

- **Tablas Principales**: ~30 tablas
- **Relaciones**: Múltiples relaciones uno-a-muchos y muchos-a-muchos
- **Índices**: Optimizados para consultas frecuentes
- **Constraints**: Claves únicas y foráneas
- **Enums**: 15+ enumeraciones para tipos de datos

## 🔐 Seguridad de Datos

### Validaciones
- **Unique Constraints**: Email, RUT, códigos únicos
- **Foreign Keys**: Integridad referencial
- **Check Constraints**: Validaciones a nivel de BD
- **Not Null**: Campos obligatorios

### Auditoría
- **CreatedAt/UpdatedAt**: Timestamps automáticos
- **User Tracking**: Seguimiento de quién crea/modifica
- **Soft Deletes**: Eliminación lógica cuando es necesario
- **Activity Logs**: Registro de actividades importantes

## 🚀 Rendimiento

### Optimizaciones
- **Connection Pooling**: Pool de conexiones
- **Query Optimization**: Consultas optimizadas con Prisma
- **Selective Loading**: Carga selectiva de relaciones
- **Pagination**: Paginación eficiente

### Monitoreo
- **Query Performance**: Monitoreo de rendimiento de consultas
- **Connection Monitoring**: Monitoreo de conexiones
- **Index Usage**: Uso de índices