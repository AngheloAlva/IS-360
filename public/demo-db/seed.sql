-- IS 360 demo seed (Iter 1 — minimum viable for Work Orders)
-- Idempotent: all inserts use ON CONFLICT DO NOTHING. Bootstrap tracks via _demo_seed_meta.
-- IDs are stable so URLs survive reloads.

-- ─── Users (no-company first to break user↔company FK cycle) ───────────────
-- Must mirror src/lib/demo-auth/users.ts so getDemoUser().id matches a real row.
INSERT INTO "user" ("id", "name", "email", "emailVerified", "rut", "role", "accessRole", "isSupervisor", "companyId", "createdAt", "updatedAt", "isActive")
VALUES
  ('demo-admin',    'Admin Demo',      'admin@ingsimple.cl',    true, '11.111.111-1', 'admin',         'ADMIN', false, NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('demo-tech',     'Técnico Demo',    'tecnico@ingsimple.cl',  true, '12.222.222-2', 'internal-tech', 'ADMIN', false, NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('seed-user-001', 'María Fernández', 'maria.f@ingsimple.cl',  true, '14.444.444-4', 'internal-tech', 'ADMIN', false, NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('seed-user-002', 'Carlos Rojas',    'carlos.r@ingsimple.cl', true, '15.555.555-5', 'internal-tech', 'ADMIN', true,  NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true)
ON CONFLICT ("id") DO NOTHING;

-- ─── Companies (after admin exists for createdById FK) ──────────────────────
INSERT INTO "company" ("id", "name", "rut", "isActive", "createdById", "createdAt", "updatedAt")
VALUES
  ('demo-company-1', 'Contratista Norte SpA', '76.111.111-1', true, 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-company-2', 'Servicios Andinos Ltda', '76.222.222-2', true, 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Supervisors (depend on companies) ──────────────────────────────────────
INSERT INTO "user" ("id", "name", "email", "emailVerified", "rut", "role", "accessRole", "isSupervisor", "companyId", "createdAt", "updatedAt", "isActive")
VALUES
  ('demo-supervisor',   'Supervisor Demo',  'supervisor@ingsimple.cl',  true, '13.333.333-3', 'supervisor', 'PARTNER_COMPANY', true, 'demo-company-1', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('seed-supervisor-2', 'Patricia Soto',    'patricia.s@andinos.cl',    true, '16.666.666-6', 'supervisor', 'PARTNER_COMPANY', true, 'demo-company-2', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true)
ON CONFLICT ("id") DO NOTHING;

-- ─── Location (single root for now) ─────────────────────────────────────────
INSERT INTO "Location" ("id", "name", "parentId", "path", "createdAt", "updatedAt")
VALUES
  ('demo-loc-1', 'Planta Principal', NULL, 'Planta Principal', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Equipment ──────────────────────────────────────────────────────────────
INSERT INTO "equipment" ("id", "barcode", "name", "description", "isOperational", "type", "tag", "criticality", "locationId", "createdById", "createdAt", "updatedAt")
VALUES
  ('demo-eq-001', 'EQ-001', 'Bomba Centrífuga A',    'Bomba principal de impulsión',     true,  'PUMP',        'BC-001', 'CRITICAL',     'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-002', 'EQ-002', 'Compresor Industrial',  'Compresor de aire 50HP',           true,  'COMPRESSOR',  'CP-001', 'SEMICRITICAL', 'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-003', 'EQ-003', 'Motor Eléctrico 75kW',  'Motor trifásico de accionamiento', true,  'MOTOR',       'ME-001', 'CRITICAL',     'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-004', 'EQ-004', 'Tablero Eléctrico TG1', 'Tablero general de distribución',  true,  'ELECTRICAL',  'TE-001', 'CRITICAL',     'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-005', 'EQ-005', 'Intercambiador IC-2',   'Intercambiador de calor',          true,  'HEAT_EX',     'IC-002', 'SEMICRITICAL', 'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-006', 'EQ-006', 'Válvula Reguladora V1', 'Válvula de control principal',     false, 'VALVE',       'VR-001', 'UNCITICAL',    'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Work Orders (5 across distinct statuses) ──────────────────────────────
INSERT INTO "work_order" (
  "id", "otNumber", "type", "status", "progress",
  "solicitationDate", "solicitationTime", "workRequest", "workDescription",
  "priority", "capex", "programDate", "estimatedHours", "estimatedDays", "estimatedEndDate",
  "companyId", "supervisorId", "responsibleId", "createdAt", "updatedAt"
)
VALUES
  ('demo-wo-001', 'OT-2026-0001', 'PREVENTIVE', 'PLANNED',           0,
   '2026-05-01T09:00:00Z', '09:00:00', 'Mantenimiento programado bomba A', 'Cambio de sellos y revisión de impulsor',
   'MEDIUM', 'CONFIDABILITY', '2026-05-20T08:00:00Z', 4, 1, '2026-05-20T12:00:00Z',
   'demo-company-1', 'demo-supervisor', 'demo-tech',     '2026-05-01T09:00:00Z', '2026-05-01T09:00:00Z'),
  ('demo-wo-002', 'OT-2026-0002', 'CORRECTIVE', 'IN_PROGRESS',      25,
   '2026-05-10T11:30:00Z', '11:30:00', 'Falla compresor industrial',       'Compresor presenta vibración anormal',
   'HIGH',   'MITIGATE_RISK', '2026-05-12T08:00:00Z', 6, 1, '2026-05-12T14:00:00Z',
   'demo-company-1', 'demo-supervisor', 'demo-tech',     '2026-05-10T11:30:00Z', '2026-05-10T11:30:00Z'),
  ('demo-wo-003', 'OT-2026-0003', 'PREDICTIVE', 'COMPLETED',       100,
   '2026-04-15T08:00:00Z', '08:00:00', 'Inspección termográfica TG1',      'Inspección preventiva con cámara térmica',
   'LOW',    'COMPLIANCE',    '2026-04-18T08:00:00Z', 2, 1, '2026-04-18T10:00:00Z',
   NULL,             'demo-supervisor', 'seed-user-002', '2026-04-15T08:00:00Z', '2026-04-18T10:30:00Z'),
  ('demo-wo-004', 'OT-2026-0004', 'PREVENTIVE', 'COMPLETED',          100,
   '2026-04-20T10:00:00Z', '10:00:00', 'Cambio aceite motor 75kW',         'Cambio de aceite y filtros programado',
   'MEDIUM', 'CONFIDABILITY', '2026-04-25T08:00:00Z', 3, 1, '2026-04-25T11:00:00Z',
   'demo-company-2', 'demo-supervisor', 'demo-tech',     '2026-04-20T10:00:00Z', '2026-04-26T09:00:00Z'),
  ('demo-wo-005', 'OT-2026-0005', 'CORRECTIVE', 'PENDING',          15,
   '2026-05-14T14:00:00Z', '14:00:00', 'Reparación válvula reguladora',    'Válvula no responde al accionamiento',
   'HIGH',   'MITIGATE_RISK', '2026-05-18T08:00:00Z', 8, 2, '2026-05-19T16:00:00Z',
   'demo-company-2', 'demo-supervisor', 'demo-tech',     '2026-05-14T14:00:00Z', '2026-05-14T14:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Milestones for demo-wo-004 (CLOSURE_REQUESTED, all done) ──────────────
-- Lets the APPROVE-closure flow be tested end-to-end.
INSERT INTO "milestone" ("id", "name", "description", "status", "order", "isCompleted", "weight", "startDate", "endDate", "workOrderId", "requestedById", "createdAt", "updatedAt")
VALUES
  ('demo-ms-001', 'Drenaje del aceite usado',     'Vaciado completo del cárter',     'COMPLETED', 1, true,  30, '2026-04-25T08:00:00Z', '2026-04-25T09:00:00Z', 'demo-wo-004', 'demo-tech', '2026-04-25T08:00:00Z', '2026-04-25T09:00:00Z'),
  ('demo-ms-002', 'Cambio de filtros',            'Filtros de aceite y aire',        'COMPLETED', 2, true,  30, '2026-04-25T09:00:00Z', '2026-04-25T10:00:00Z', 'demo-wo-004', 'demo-tech', '2026-04-25T09:00:00Z', '2026-04-25T10:00:00Z'),
  ('demo-ms-003', 'Llenado y verificación final', 'Aceite nuevo y revisión',         'COMPLETED', 3, true,  40, '2026-04-25T10:00:00Z', '2026-04-25T11:00:00Z', 'demo-wo-004', 'demo-tech', '2026-04-25T10:00:00Z', '2026-04-25T11:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Milestones for demo-wo-002 (IN_PROGRESS, mixed states) ─────────────────
-- Lets the REQUEST-closure flow be tested: complete the 2 PENDING milestones
-- from the UI, progress hits 100, "Solicitar cierre" becomes available.
INSERT INTO "milestone" ("id", "name", "description", "status", "order", "isCompleted", "weight", "startDate", "endDate", "workOrderId", "requestedById", "createdAt", "updatedAt")
VALUES
  ('demo-ms-101', 'Diagnóstico inicial',  'Inspección y diagnóstico de vibración', 'COMPLETED', 1, true,  25, '2026-05-12T08:00:00Z', '2026-05-12T09:30:00Z', 'demo-wo-002', 'demo-tech',     '2026-05-12T08:00:00Z', '2026-05-12T09:30:00Z'),
  ('demo-ms-102', 'Reparación',           'Reemplazo de componente defectuoso',    'PENDING',   2, false, 50, '2026-05-12T10:00:00Z', '2026-05-12T14:00:00Z', 'demo-wo-002', NULL,            '2026-05-12T10:00:00Z', '2026-05-12T10:00:00Z'),
  ('demo-ms-103', 'Pruebas y entrega',    'Pruebas funcionales y firma de cierre', 'PENDING',   3, false, 25, '2026-05-12T14:00:00Z', '2026-05-12T16:00:00Z', 'demo-wo-002', NULL,            '2026-05-12T10:00:00Z', '2026-05-12T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Daily activities (work_book_entry) for each milestone of demo-wo-004 ──
-- Domain rule: a milestone cannot be COMPLETED without ≥1 work_book_entry.
INSERT INTO "work_book_entry" ("id", "entryType", "executionDate", "activityName", "activityStartTime", "activityEndTime", "comments", "createdById", "workOrderId", "milestoneId", "createdAt")
VALUES
  ('demo-wbe-001', 'DAILY_ACTIVITY', '2026-04-25T08:30:00Z', 'Drenaje completo del aceite', '08:00', '09:00', 'Aceite extraído sin observaciones', 'demo-tech', 'demo-wo-004', 'demo-ms-001', '2026-04-25T09:00:00Z'),
  ('demo-wbe-002', 'DAILY_ACTIVITY', '2026-04-25T09:30:00Z', 'Reemplazo filtro aceite', '09:00', '09:30', 'Filtro nuevo instalado',           'demo-tech', 'demo-wo-004', 'demo-ms-002', '2026-04-25T09:30:00Z'),
  ('demo-wbe-003', 'DAILY_ACTIVITY', '2026-04-25T09:45:00Z', 'Reemplazo filtro aire',   '09:30', '09:45', 'Filtro aire reemplazado',           'demo-tech', 'demo-wo-004', 'demo-ms-002', '2026-04-25T09:45:00Z'),
  ('demo-wbe-004', 'DAILY_ACTIVITY', '2026-04-25T10:30:00Z', 'Llenado aceite nuevo',    '10:00', '10:30', 'Nivel correcto, sin fugas',         'demo-tech', 'demo-wo-004', 'demo-ms-003', '2026-04-25T10:30:00Z'),
  ('demo-wbe-005', 'DAILY_ACTIVITY', '2026-04-25T11:00:00Z', 'Prueba de marcha final',  '10:30', '11:00', 'Motor opera normal, sin ruidos',    'demo-tech', 'demo-wo-004', 'demo-ms-003', '2026-04-25T11:00:00Z'),
  -- demo-wo-002: entry for the one COMPLETED milestone (demo-ms-101)
  ('demo-wbe-101', 'DAILY_ACTIVITY', '2026-05-12T09:15:00Z', 'Análisis de vibración', '08:00', '09:30', 'Diagnóstico: rodamiento desgastado', 'demo-tech', 'demo-wo-002', 'demo-ms-101', '2026-05-12T09:30:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Equipment ↔ Work Order (Prisma implicit M2N) ───────────────────────────
INSERT INTO "_EquipmentToWorkOrder" ("A", "B") VALUES
  ('demo-eq-001', 'demo-wo-001'),
  ('demo-eq-002', 'demo-wo-002'),
  ('demo-eq-004', 'demo-wo-003'),
  ('demo-eq-003', 'demo-wo-004'),
  ('demo-eq-006', 'demo-wo-005')
ON CONFLICT DO NOTHING;

-- ─── Re-runnable adjustments ────────────────────────────────────────────────
-- These UPDATEs keep already-seeded databases consistent when seed data evolves
-- (ON CONFLICT DO NOTHING above won't fix rows that pre-existed).
-- demo-wo-004: closed (CLOSURE_REQUESTED is dead state in OTC original; demo skips it).
UPDATE "work_order"
SET progress = 100,
    status = 'COMPLETED',
    "endDate" = '2026-04-25T11:30:00Z',
    "closureRequestedById" = NULL,
    "closureRequestedAt" = NULL
WHERE id = 'demo-wo-004';

-- demo-wo-002: progress must reflect milestone weight (only demo-ms-101 weight=25 is COMPLETED).
UPDATE "work_order" SET progress = 25 WHERE id = 'demo-wo-002';

-- Reassign responsibles to a user that can actually log in (Técnico Demo).
-- seed-user-001/002 exist as DB rows but are NOT in DEMO_USERS, so they can't approve anything.
UPDATE "work_order" SET "responsibleId" = 'demo-tech'
WHERE id IN ('demo-wo-002', 'demo-wo-005');

-- demo-wo-002.milestone-101 was originally requested by seed-user-001; same fix.
UPDATE "milestone" SET "requestedById" = 'demo-tech'
WHERE id = 'demo-ms-101';

-- And the seeded work-book entry for demo-wo-002 was created by seed-user-001.
UPDATE "work_book_entry" SET "createdById" = 'demo-tech'
WHERE id = 'demo-wbe-101';

-- Also correct progress for any other WOs whose seed value was arbitrary.
-- demo-wo-003 is COMPLETED with no milestones → leave at 100 (no inconsistency to detect).
-- demo-wo-001 / demo-wo-005 have no milestones → leave their starter values.
