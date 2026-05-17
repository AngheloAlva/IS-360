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

-- ─── Locations (root + 3 children, hierarchical) ───────────────────────────
INSERT INTO "Location" ("id", "name", "parentId", "path", "createdAt", "updatedAt")
VALUES
  ('demo-loc-1',     'Planta Principal', NULL,          'Planta Principal',                       '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-loc-pump',  'Sala de Bombas',   'demo-loc-1',  'Planta Principal / Sala de Bombas',      '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-loc-elec',  'Sala Eléctrica',   'demo-loc-1',  'Planta Principal / Sala Eléctrica',      '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-loc-yard',  'Patio Externo',    'demo-loc-1',  'Planta Principal / Patio Externo',       '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Equipment ──────────────────────────────────────────────────────────────
INSERT INTO "equipment" ("id", "barcode", "name", "description", "isOperational", "type", "tag", "criticality", "locationId", "createdById", "createdAt", "updatedAt")
VALUES
  ('demo-eq-001', 'EQ-001', 'Bomba Centrífuga A',    'Bomba principal de impulsión',     true,  'PUMP',        'BC-001', 'CRITICAL',     'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-002', 'EQ-002', 'Compresor Industrial',  'Compresor de aire 50HP',           true,  'COMPRESSOR',  'CP-001', 'SEMICRITICAL', 'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-003', 'EQ-003', 'Motor Eléctrico 75kW',  'Motor trifásico de accionamiento', true,  'MOTOR',       'ME-001', 'CRITICAL',     'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-004', 'EQ-004', 'Tablero Eléctrico TG1', 'Tablero general de distribución',  true,  'ELECTRICAL',  'TE-001', 'CRITICAL',     'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-005', 'EQ-005', 'Intercambiador IC-2',   'Intercambiador de calor',          true,  'HEAT_EX',     'IC-002', 'SEMICRITICAL', 'demo-loc-1', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-006', 'EQ-006', 'Válvula Reguladora V1', 'Válvula de control principal',     false, 'VALVE',       'VR-001', 'UNCITICAL',    'demo-loc-1',    'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-007', 'EQ-007', 'Generador Auxiliar',    'Generador diésel 200kVA',          true,  'GENERATOR',   'GA-001', 'CRITICAL',     'demo-loc-yard', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-008', 'EQ-008', 'Compresor de Respaldo', 'Compresor secundario 30HP',        true,  'COMPRESSOR',  'CP-002', 'SEMICRITICAL', 'demo-loc-pump', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z')
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

-- ─── Work Permits (3 in distinct statuses) ────────────────────────────────
INSERT INTO "work_permit" (
  "id", "status", "isUrgent",
  "aplicantPt", "mutuality", "exactPlace", "workWillBe",
  "tools", "preChecks", "activityDetails", "riskIdentification", "preventiveControlMeasures",
  "generateWaste", "acceptTerms",
  "startDate", "endDate", "createdAt", "updatedAt",
  "otNumberId", "userId", "companyId",
  "approvalDate", "approvalById", "closingDate", "closingById"
)
VALUES
  ('demo-wp-001', 'ACTIVE', false,
   'Patricia Soto', 'ACHS', 'Sala de Bombas — Bomba A', 'Mantenimiento mecánico',
   ARRAY['Llave dinamométrica','Escalera','Equipo de bloqueo'], ARRAY['Inspección visual','Charla de 5 minutos'],
   ARRAY['Cambio de sellos en bomba'], ARRAY['Caída a distinto nivel','Atrapamiento'], ARRAY['Uso de arnés','Bloqueo y etiquetado'],
   false, true,
   '2026-05-18T08:00:00Z', '2026-05-18T16:00:00Z', '2026-05-15T10:00:00Z', '2026-05-15T10:00:00Z',
   'demo-wo-001', 'demo-supervisor', 'demo-company-1',
   '2026-05-15T11:00:00Z', 'demo-admin', NULL, NULL),
  ('demo-wp-002', 'REVIEW_PENDING', true,
   'Carlos Rojas', 'Mutual de Seguridad', 'Patio Externo — Generador Auxiliar', 'Trabajo eléctrico',
   ARRAY['Multímetro','Pinza amperimétrica','Equipo de bloqueo'], ARRAY['Inspección visual','Verificación de tensión'],
   ARRAY['Diagnóstico eléctrico generador'], ARRAY['Contacto eléctrico','Arco eléctrico'], ARRAY['EPP dieléctrico','Bloqueo y etiquetado'],
   false, true,
   '2026-05-20T09:00:00Z', '2026-05-20T13:00:00Z', '2026-05-16T08:30:00Z', '2026-05-16T08:30:00Z',
   NULL, 'demo-supervisor', 'demo-company-1',
   NULL, NULL, NULL, NULL),
  ('demo-wp-003', 'COMPLETED', false,
   'Patricia Soto', 'ACHS', 'Sala Eléctrica — Tablero TG1', 'Inspección termográfica',
   ARRAY['Cámara termográfica','EPP eléctrico'], ARRAY['Inspección visual','Charla de 5 minutos'],
   ARRAY['Inspección termográfica programada'], ARRAY['Contacto eléctrico'], ARRAY['EPP dieléctrico','Distancia segura'],
   false, true,
   '2026-04-18T08:00:00Z', '2026-04-18T10:00:00Z', '2026-04-17T09:00:00Z', '2026-04-18T11:00:00Z',
   'demo-wo-003', 'seed-supervisor-2', 'demo-company-2',
   '2026-04-17T15:00:00Z', 'demo-admin', '2026-04-18T11:00:00Z', 'demo-admin')
ON CONFLICT ("id") DO NOTHING;

-- ─── Work Permit ↔ participants (Prisma implicit M2N) ──────────────────────
INSERT INTO "_WorkPermitParticipants" ("A", "B") VALUES
  ('demo-tech',        'demo-wp-001'),
  ('seed-user-001',    'demo-wp-001'),
  ('demo-tech',        'demo-wp-002'),
  ('seed-supervisor-2','demo-wp-003')
ON CONFLICT DO NOTHING;

-- ─── Maintenance Plans + tasks ─────────────────────────────────────────────
INSERT INTO "maintenance_plan" ("id", "slug", "name", "description", "isActive", "equipmentId", "createdById", "createdAt", "updatedAt")
VALUES
  ('demo-mp-001', 'plan-bomba-centrifuga-a', 'Plan Bomba Centrífuga A', 'Mantenimiento preventivo programado para BC-001', true, 'demo-eq-001', 'demo-admin', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('demo-mp-002', 'plan-motor-electrico-75kw', 'Plan Motor Eléctrico 75kW', 'Mantenimiento preventivo para ME-001', true, 'demo-eq-003', 'demo-admin', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "maintenance_plan_task" (
  "id", "slug", "name", "description", "isActive", "frequency", "nextDate",
  "originalDayOfMonth", "isAutomated", "automatedDaysInAdvance",
  "blockIfPreviousNotCompleted", "emailsForCopy",
  "equipmentId", "maintenancePlanId", "createdById", "automatedResponsibleId",
  "createdAt", "updatedAt"
)
VALUES
  ('demo-mpt-001', 'inspeccion-vibraciones-bc-001', 'Inspección de vibraciones', 'Medición y análisis de vibraciones',  true, 'MONTHLY',   '2026-05-30T08:00:00Z', 30, true,  5, true, ARRAY[]::TEXT[], 'demo-eq-001', 'demo-mp-001', 'demo-admin', 'demo-tech', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('demo-mpt-002', 'cambio-sellos-bc-001',          'Cambio de sellos',          'Reemplazo de sellos mecánicos',       true, 'BIANNUAL', '2026-07-15T08:00:00Z', 15, false, 7, true, ARRAY[]::TEXT[], 'demo-eq-001', 'demo-mp-001', 'demo-admin', 'demo-tech', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('demo-mpt-003', 'cambio-aceite-me-001',          'Cambio de aceite',          'Cambio de aceite y filtros',          true, 'QUARTERLY','2026-06-25T08:00:00Z', 25, true,  5, true, ARRAY[]::TEXT[], 'demo-eq-003', 'demo-mp-002', 'demo-admin', 'demo-tech', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z'),
  ('demo-mpt-004', 'termografia-me-001',            'Inspección termográfica',   'Termografía y análisis térmico',      true, 'MONTHLY',  '2026-05-28T08:00:00Z', 28, false, 5, true, ARRAY[]::TEXT[], 'demo-eq-003', 'demo-mp-002', 'demo-admin', 'demo-tech', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "_MaintenancePlanTaskEquipments" ("A", "B") VALUES
  ('demo-eq-001', 'demo-mpt-001'),
  ('demo-eq-001', 'demo-mpt-002'),
  ('demo-eq-003', 'demo-mpt-003'),
  ('demo-eq-003', 'demo-mpt-004')
ON CONFLICT DO NOTHING;

-- ─── Work Requests + counter ────────────────────────────────────────────────
INSERT INTO "work_request_counter" ("id", "value") VALUES ('work-request-counter', 3)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "work_request" (
  "id", "requestNumber", "description", "isUrgent", "requestDate", "observations",
  "status", "workType", "userId", "createdAt", "updatedAt",
  "approvalDate", "approvalById"
)
VALUES
  ('demo-wr-001', 'REQ-2026-0001', 'Compresor secundario presenta ruido anormal', true,  '2026-05-14T08:30:00Z', 'Detectado durante turno matutino', 'REPORTED', 'MECHANIC',  'demo-supervisor', '2026-05-14T08:30:00Z', '2026-05-14T08:30:00Z', NULL,                   NULL),
  ('demo-wr-002', 'REQ-2026-0002', 'Solicitud limpieza tablero TG1',              false, '2026-05-10T09:15:00Z', 'Limpieza preventiva trimestral',   'APPROVED', 'ELECTRIC',  'demo-supervisor', '2026-05-10T09:15:00Z', '2026-05-11T11:00:00Z', '2026-05-11T11:00:00Z', 'demo-admin'),
  ('demo-wr-003', 'REQ-2026-0003', 'Revisión generador auxiliar tras prueba',     false, '2026-05-08T14:00:00Z', 'Posterior a prueba de carga',      'ATTENDED', 'MECHANIC',  'seed-supervisor-2', '2026-05-08T14:00:00Z', '2026-05-09T16:00:00Z', '2026-05-09T16:00:00Z', 'demo-admin')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "_EquipmentToWorkRequest" ("A", "B") VALUES
  ('demo-eq-008', 'demo-wr-001'),
  ('demo-eq-004', 'demo-wr-002'),
  ('demo-eq-007', 'demo-wr-003')
ON CONFLICT DO NOTHING;

INSERT INTO "work_request_comment" ("id", "content", "userId", "workRequestId", "createdAt", "updatedAt")
VALUES
  ('demo-wrc-001', 'Confirmamos visita técnica el viernes',    'demo-admin', 'demo-wr-002', '2026-05-10T15:00:00Z', '2026-05-10T15:00:00Z'),
  ('demo-wrc-002', 'Generador OK, parámetros normales',        'demo-tech',  'demo-wr-003', '2026-05-09T16:30:00Z', '2026-05-09T16:30:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Equipment ↔ Work Order (Prisma implicit M2N) ───────────────────────────
INSERT INTO "_EquipmentToWorkOrder" ("A", "B") VALUES
  ('demo-eq-001', 'demo-wo-001'),
  ('demo-eq-002', 'demo-wo-002'),
  ('demo-eq-004', 'demo-wo-003'),
  ('demo-eq-003', 'demo-wo-004'),
  ('demo-eq-006', 'demo-wo-005')
ON CONFLICT DO NOTHING;

-- ─── Vehicles ───────────────────────────────────────────────────────────────
INSERT INTO "vehicle" ("id", "plate", "model", "year", "brand", "type", "color", "isMain", "isActive", "companyId", "createdAt", "updatedAt") VALUES
  ('demo-vehicle-1', 'GHJK-21', 'Hilux',     2022, 'Toyota', 'TRUCK', 'Blanco', true,  true, 'demo-company-1', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('demo-vehicle-2', 'LPQR-58', 'NP300',     2021, 'Nissan', 'TRUCK', 'Gris',   false, true, 'demo-company-1', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z'),
  ('demo-vehicle-3', 'MNST-90', 'Ranger',    2023, 'Ford',   'TRUCK', 'Negro',  true,  true, 'demo-company-2', '2026-03-05T10:00:00Z', '2026-03-05T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Additional partner-company workers (for startup-folder demo) ───────────
INSERT INTO "user" ("id", "name", "email", "emailVerified", "rut", "role", "accessRole", "isSupervisor", "companyId", "createdAt", "updatedAt", "isActive")
VALUES
  ('demo-worker-1', 'Juan Pérez',     'juan.perez@contratista.cl',     true, '18.111.111-1', 'worker', 'PARTNER_COMPANY', false, 'demo-company-1', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z', true),
  ('demo-worker-2', 'María González', 'maria.gonzalez@contratista.cl', true, '19.222.222-2', 'worker', 'PARTNER_COMPANY', false, 'demo-company-1', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z', true),
  ('demo-worker-3', 'Carlos Vega',    'carlos.vega@andinos.cl',        true, '20.333.333-3', 'driver', 'PARTNER_COMPANY', false, 'demo-company-2', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z', true)
ON CONFLICT ("id") DO NOTHING;

-- ─── Startup Folders ────────────────────────────────────────────────────────
INSERT INTO "startup_folder" ("id", "name", "type", "status", "moreMonthDuration", "isDeleted", "isArchived", "companyId", "createdAt", "updatedAt") VALUES
  ('demo-sf-001', 'Carpeta Q1 2026', 'FULL',  'IN_PROGRESS', false, false, false, 'demo-company-1', '2026-01-20T10:00:00Z', '2026-04-15T10:00:00Z'),
  ('demo-sf-002', 'Carpeta Q2 2026', 'BASIC', 'PENDING',     true,  false, false, 'demo-company-1', '2026-04-01T10:00:00Z', '2026-04-01T10:00:00Z'),
  ('demo-sf-003', 'Carpeta Q1 2026', 'FULL',  'IN_PROGRESS', false, false, false, 'demo-company-2', '2026-02-15T10:00:00Z', '2026-04-10T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Sub-folders for demo-sf-001 (FULL Q1 2026, demo-company-1) ─────────────
INSERT INTO "safety_and_health_folder" ("id", "status", "additionalNotificationEmails", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-sah-001', 'SUBMITTED', ARRAY[]::text[], 'demo-sf-001', '2026-01-20T10:00:00Z', '2026-04-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "environment_folder" ("id", "status", "additionalNotificationEmails", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-env-001', 'DRAFT', ARRAY[]::text[], 'demo-sf-001', '2026-01-20T10:00:00Z', '2026-01-20T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "tech_specs_folder" ("id", "status", "additionalNotificationEmails", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-tech-001', 'APPROVED', ARRAY[]::text[], 'demo-sf-001', '2026-01-20T10:00:00Z', '2026-03-15T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "worker_folders" ("id", "status", "additionalNotificationEmails", "isDriver", "workerId", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-wf-001', 'DRAFT',     ARRAY[]::text[], false, 'demo-worker-1', 'demo-sf-001', '2026-01-20T10:00:00Z', '2026-04-01T10:00:00Z'),
  ('demo-wf-002', 'SUBMITTED', ARRAY[]::text[], true,  'demo-worker-2', 'demo-sf-001', '2026-01-20T10:00:00Z', '2026-04-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "basic_folder" ("id", "status", "additionalNotificationEmails", "workerId", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-bf-001', 'APPROVED', ARRAY[]::text[], 'demo-worker-1', 'demo-sf-001', '2026-01-20T10:00:00Z', '2026-03-15T10:00:00Z'),
  ('demo-bf-002', 'DRAFT',    ARRAY[]::text[], 'demo-worker-2', 'demo-sf-001', '2026-01-20T10:00:00Z', '2026-01-20T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "vehicle_folders" ("id", "status", "additionalNotificationEmails", "vehicleId", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-vf-001', 'SUBMITTED', ARRAY[]::text[], 'demo-vehicle-1', 'demo-sf-001', '2026-01-20T10:00:00Z', '2026-04-05T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Sub-folders for demo-sf-002 (BASIC Q2 2026, demo-company-1) ────────────
INSERT INTO "basic_folder" ("id", "status", "additionalNotificationEmails", "workerId", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-bf-003', 'DRAFT', ARRAY[]::text[], 'demo-worker-1', 'demo-sf-002', '2026-04-01T10:00:00Z', '2026-04-01T10:00:00Z'),
  ('demo-bf-004', 'DRAFT', ARRAY[]::text[], 'demo-worker-2', 'demo-sf-002', '2026-04-01T10:00:00Z', '2026-04-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Sub-folders for demo-sf-003 (FULL Q1 2026, demo-company-2) ─────────────
INSERT INTO "safety_and_health_folder" ("id", "status", "additionalNotificationEmails", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-sah-003', 'APPROVED', ARRAY[]::text[], 'demo-sf-003', '2026-02-15T10:00:00Z', '2026-03-20T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "environment_folder" ("id", "status", "additionalNotificationEmails", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-env-003', 'SUBMITTED', ARRAY[]::text[], 'demo-sf-003', '2026-02-15T10:00:00Z', '2026-04-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "tech_specs_folder" ("id", "status", "additionalNotificationEmails", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-tech-003', 'DRAFT', ARRAY[]::text[], 'demo-sf-003', '2026-02-15T10:00:00Z', '2026-02-15T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "worker_folders" ("id", "status", "additionalNotificationEmails", "isDriver", "workerId", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-wf-003', 'DRAFT', ARRAY[]::text[], true, 'demo-worker-3', 'demo-sf-003', '2026-02-15T10:00:00Z', '2026-04-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "vehicle_folders" ("id", "status", "additionalNotificationEmails", "vehicleId", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-vf-003', 'DRAFT', ARRAY[]::text[], 'demo-vehicle-3', 'demo-sf-003', '2026-02-15T10:00:00Z', '2026-02-15T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Documents (a mix of statuses for visual demo) ──────────────────────────
-- demo-bf-001 (Juan Pérez basic, APPROVED): 3 approved docs
INSERT INTO "basic_document" ("id", "type", "name", "url", "category", "status", "expirationDate", "uploadedById", "folderId", "uploadedAt", "reviewedAt") VALUES
  ('demo-doc-b001', 'CONTRACT',     'Contrato Juan Pérez',           'https://example.com/contract.pdf',  'BASIC', 'APPROVED', '2027-01-01T00:00:00Z', 'demo-supervisor', 'demo-bf-001', '2026-01-25T10:00:00Z', '2026-02-01T10:00:00Z'),
  ('demo-doc-b002', 'INSURANCE',    'Seguro Accidentes Juan Pérez',  'https://example.com/insurance.pdf', 'BASIC', 'APPROVED', '2026-12-31T00:00:00Z', 'demo-supervisor', 'demo-bf-001', '2026-01-25T10:00:00Z', '2026-02-01T10:00:00Z'),
  ('demo-doc-b003', 'PPE_RECEIPT',  'Entrega EPP Juan Pérez',        'https://example.com/ppe.pdf',       'BASIC', 'APPROVED', '2027-01-01T00:00:00Z', 'demo-supervisor', 'demo-bf-001', '2026-01-25T10:00:00Z', '2026-02-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- demo-bf-002 (María González basic, DRAFT): 1 draft doc
INSERT INTO "basic_document" ("id", "type", "name", "url", "category", "status", "expirationDate", "uploadedById", "folderId", "uploadedAt") VALUES
  ('demo-doc-b004', 'CONTRACT', 'Contrato María González', 'https://example.com/contract2.pdf', 'BASIC', 'DRAFT', '2027-01-01T00:00:00Z', 'demo-supervisor', 'demo-bf-002', '2026-02-15T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- demo-vf-001 (vehicle Hilux, SUBMITTED): 2 submitted docs
INSERT INTO "vehicle_document" ("id", "type", "name", "url", "category", "status", "expirationDate", "uploadedById", "folderId", "uploadedAt", "submittedAt") VALUES
  ('demo-doc-v001', 'CIRCULATION_PERMIT', 'Permiso Circulación Hilux',  'https://example.com/perm.pdf', 'VEHICLES', 'SUBMITTED', '2027-03-31T00:00:00Z', 'demo-supervisor', 'demo-vf-001', '2026-04-01T10:00:00Z', '2026-04-05T10:00:00Z'),
  ('demo-doc-v002', 'TECHNICAL_REVIEW',   'Revisión Técnica Hilux',     'https://example.com/tech.pdf', 'VEHICLES', 'SUBMITTED', '2027-03-31T00:00:00Z', 'demo-supervisor', 'demo-vf-001', '2026-04-01T10:00:00Z', '2026-04-05T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- demo-sah-001 (safety, SUBMITTED): 1 doc submitted, 1 rejected for visual diversity
INSERT INTO "safety_and_health_document" ("id", "type", "name", "url", "category", "status", "uploadedById", "folderId", "uploadedAt", "submittedAt", "reviewedAt", "reviewNotes") VALUES
  ('demo-doc-s001', 'COMPANY_INFO',          'Antecedentes Empresa',       'https://example.com/co.pdf',   'SAFETY_AND_HEALTH', 'SUBMITTED', 'demo-supervisor', 'demo-sah-001', '2026-03-20T10:00:00Z', '2026-04-01T10:00:00Z', NULL, NULL),
  ('demo-doc-s002', 'PREVENTION_PLAN',       'Plan de Prevención de Riesgos','https://example.com/risk.pdf', 'SAFETY_AND_HEALTH', 'REJECTED',  'demo-supervisor', 'demo-sah-001', '2026-03-20T10:00:00Z', '2026-04-01T10:00:00Z', '2026-04-02T10:00:00Z', 'Falta firma legal')
ON CONFLICT ("id") DO NOTHING;

-- demo-tech-001 (tech specs, APPROVED): 1 approved doc
INSERT INTO "tech_specs_document" ("id", "type", "name", "url", "category", "status", "uploadedById", "folderId", "uploadedAt", "reviewedAt") VALUES
  ('demo-doc-t001', 'TECHNICAL_WORK_PROCEDURE', 'Procedimiento Trabajo Técnico', 'https://example.com/twp.pdf', 'TECHNICAL_SPECS', 'APPROVED', 'demo-supervisor', 'demo-tech-001', '2026-02-01T10:00:00Z', '2026-03-15T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

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

-- Reassign existing equipment to the new sub-locations (introduced in this seed bump).
-- Reads better in the UI: equipos agrupados por sub-area.
UPDATE "equipment" SET "locationId" = 'demo-loc-pump' WHERE id IN ('demo-eq-001');
UPDATE "equipment" SET "locationId" = 'demo-loc-elec' WHERE id IN ('demo-eq-003', 'demo-eq-004');
