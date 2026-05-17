-- IS 360 demo seed — Refinería Cabo Negro (rubro petrolero / mantenimiento)
-- Idempotent: all inserts use ON CONFLICT DO NOTHING. Bootstrap tracks via _demo_seed_meta.
-- IDs are stable so URLs survive reloads.

-- ─── Users (no-company first to break user↔company FK cycle) ───────────────
-- Must mirror src/lib/demo-auth/users.ts so getDemoUser().id matches a real row.
INSERT INTO "user" ("id", "name", "email", "emailVerified", "rut", "role", "accessRole", "isSupervisor", "companyId", "createdAt", "updatedAt", "isActive")
VALUES
  ('demo-admin',     'Admin Demo',         'admin@cabonegro.cl',      true, '11.111.111-1', 'admin',         'ADMIN', false, NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('demo-tech',      'Técnico Demo',       'tecnico@cabonegro.cl',    true, '12.222.222-2', 'internal-tech', 'ADMIN', false, NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('seed-admin-2',   'Daniela Cárdenas',   'daniela.cardenas@cabonegro.cl', true, '10.101.010-1', 'admin',         'ADMIN', false, NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('seed-user-001',  'María Fernández',    'maria.fernandez@cabonegro.cl',  true, '14.444.444-4', 'internal-tech', 'ADMIN', false, NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('seed-user-002',  'Carlos Rojas',       'carlos.rojas@cabonegro.cl',     true, '15.555.555-5', 'internal-tech', 'ADMIN', true,  NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('seed-user-003',  'Andrés Sepúlveda',   'andres.sepulveda@cabonegro.cl', true, '17.777.777-7', 'internal-tech', 'ADMIN', false, NULL, '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true)
ON CONFLICT ("id") DO NOTHING;

-- ─── Companies (contratistas de la refinería; "Refinería Cabo Negro" es el operador implícito) ─
INSERT INTO "company" ("id", "name", "rut", "isActive", "createdById", "createdAt", "updatedAt")
VALUES
  ('demo-company-1', 'PetroAustral Servicios Industriales SpA', '76.111.111-1', true, 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-company-2', 'MantePatagonia Petroquímica Ltda',        '76.222.222-2', true, 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Supervisors (depend on companies) ──────────────────────────────────────
INSERT INTO "user" ("id", "name", "email", "emailVerified", "rut", "role", "accessRole", "isSupervisor", "companyId", "createdAt", "updatedAt", "isActive")
VALUES
  ('demo-supervisor',   'Supervisor Demo', 'supervisor@petroaustral.cl',     true, '13.333.333-3', 'supervisor', 'PARTNER_COMPANY', true, 'demo-company-1', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('seed-supervisor-2', 'Patricia Soto',   'patricia.soto@mantepatagonia.cl', true, '16.666.666-6', 'supervisor', 'PARTNER_COMPANY', true, 'demo-company-2', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true),
  ('seed-supervisor-3', 'Rodrigo Pizarro', 'rodrigo.pizarro@petroaustral.cl', true, '21.444.444-4', 'supervisor', 'PARTNER_COMPANY', true, 'demo-company-1', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z', true)
ON CONFLICT ("id") DO NOTHING;

-- ─── Locations (refinería + 5 áreas operativas) ────────────────────────────
INSERT INTO "Location" ("id", "name", "parentId", "path", "createdAt", "updatedAt")
VALUES
  ('demo-loc-1',     'Refinería Cabo Negro', NULL,          'Refinería Cabo Negro',                         '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-loc-pump',  'Sala de Bombas',       'demo-loc-1',  'Refinería Cabo Negro / Sala de Bombas',        '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-loc-elec',  'Sala Eléctrica',       'demo-loc-1',  'Refinería Cabo Negro / Sala Eléctrica',        '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-loc-yard',  'Patio Externo',        'demo-loc-1',  'Refinería Cabo Negro / Patio Externo',         '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-loc-tanks', 'Patio de Tanques',     'demo-loc-1',  'Refinería Cabo Negro / Patio de Tanques',      '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-loc-comp',  'Zona de Compresión',   'demo-loc-1',  'Refinería Cabo Negro / Zona de Compresión',    '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Equipment ──────────────────────────────────────────────────────────────
-- 4 sistemas padre + 18 sub-equipos. parentId enlaza la jerarquía visual del árbol.
INSERT INTO "equipment" ("id", "barcode", "name", "description", "isOperational", "type", "tag", "criticality", "locationId", "parentId", "createdById", "createdAt", "updatedAt")
VALUES
  -- ─── Sistemas padre (sin parentId) ────────────────────────────────────────
  ('demo-sys-pmp', 'SYS-PMP-01', 'Sistema de Bombeo de Crudo',     'Tren de bombas centrífugas de impulsión de crudo a refinería', true, 'SYSTEM',     'SYS-PMP', 'CRITICAL',     'demo-loc-pump',  NULL, 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-sys-cmp', 'SYS-CMP-01', 'Sistema de Compresión de Gas',   'Compresores de gas combustible y aire de instrumentos',         true, 'SYSTEM',     'SYS-CMP', 'CRITICAL',     'demo-loc-comp',  NULL, 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-sys-tk',  'SYS-TK-01',  'Sistema de Almacenamiento',      'Patio de tanques de crudo y productos terminados',              true, 'SYSTEM',     'SYS-TK',  'CRITICAL',     'demo-loc-tanks', NULL, 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-sys-ele', 'SYS-ELE-01', 'Sistema Eléctrico Principal',    'Distribución eléctrica de la planta',                           true, 'SYSTEM',     'SYS-ELE', 'CRITICAL',     'demo-loc-elec',  NULL, 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),

  -- ─── Sub-equipos del Sistema de Bombeo ────────────────────────────────────
  ('demo-eq-001',  'EQ-001',     'Bomba Centrífuga BC-001',        'Bomba principal de impulsión de crudo, 250 m3/h',               true,  'PUMP',       'BC-001',  'CRITICAL',     'demo-loc-pump',  'demo-sys-pmp', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-009',  'EQ-009',     'Bomba Centrífuga BC-002',        'Bomba paralelo de impulsión, 250 m3/h',                          true,  'PUMP',       'BC-002',  'CRITICAL',     'demo-loc-pump',  'demo-sys-pmp', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-010',  'EQ-010',     'Bomba Centrífuga BC-003',        'Bomba de respaldo (stand-by) 250 m3/h',                          false, 'PUMP',       'BC-003',  'SEMICRITICAL', 'demo-loc-pump',  'demo-sys-pmp', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-005',  'EQ-005',     'Intercambiador de Calor IC-002', 'Intercambiador tubular precalentador de crudo',                  true,  'HEAT_EX',    'IC-002',  'SEMICRITICAL', 'demo-loc-pump',  'demo-sys-pmp', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-011',  'EQ-011',     'Intercambiador de Calor IC-003', 'Intercambiador placas, post-bombeo',                             true,  'HEAT_EX',    'IC-003',  'UNCITICAL',    'demo-loc-pump',  'demo-sys-pmp', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),

  -- ─── Sub-equipos del Sistema de Compresión ────────────────────────────────
  ('demo-eq-002',  'EQ-002',     'Compresor Industrial CP-001',    'Compresor de gas combustible 75 HP',                             true,  'COMPRESSOR', 'CP-001',  'CRITICAL',     'demo-loc-comp',  'demo-sys-cmp', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-008',  'EQ-008',     'Compresor de Respaldo CP-002',   'Compresor de gas combustible secundario 50 HP',                  true,  'COMPRESSOR', 'CP-002',  'SEMICRITICAL', 'demo-loc-comp',  'demo-sys-cmp', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-012',  'EQ-012',     'Compresor de Aire CP-003',       'Compresor de aire de instrumentos 30 HP',                        true,  'COMPRESSOR', 'CP-003',  'SEMICRITICAL', 'demo-loc-comp',  'demo-sys-cmp', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-006',  'EQ-006',     'Válvula Reguladora VR-001',      'Válvula de control de flujo a compresor principal',              false, 'VALVE',      'VR-001',  'UNCITICAL',    'demo-loc-comp',  'demo-sys-cmp', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),

  -- ─── Sub-equipos del Sistema de Almacenamiento ────────────────────────────
  ('demo-eq-013',  'EQ-013',     'Tanque Crudo TK-001',            'Tanque de techo flotante 10.000 m3 — crudo',                     true,  'TANK',       'TK-001',  'CRITICAL',     'demo-loc-tanks', 'demo-sys-tk',  'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-014',  'EQ-014',     'Tanque Crudo TK-002',            'Tanque de techo flotante 10.000 m3 — crudo',                     true,  'TANK',       'TK-002',  'CRITICAL',     'demo-loc-tanks', 'demo-sys-tk',  'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-015',  'EQ-015',     'Tanque Diésel TK-003',           'Tanque atmosférico 5.000 m3 — diésel terminado',                  true,  'TANK',       'TK-003',  'SEMICRITICAL', 'demo-loc-tanks', 'demo-sys-tk',  'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-016',  'EQ-016',     'Tanque Gasolina TK-004',         'Tanque atmosférico 3.000 m3 — gasolina',                          false, 'TANK',       'TK-004',  'SEMICRITICAL', 'demo-loc-tanks', 'demo-sys-tk',  'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-017',  'EQ-017',     'Horno de Calentamiento FH-001',  'Horno de proceso para crudo',                                     true,  'FURNACE',    'FH-001',  'CRITICAL',     'demo-loc-tanks', 'demo-sys-tk',  'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),

  -- ─── Sub-equipos del Sistema Eléctrico ────────────────────────────────────
  ('demo-eq-004',  'EQ-004',     'Tablero Eléctrico TE-001',       'Tablero general de distribución (TG1) 480V',                     true,  'ELECTRICAL', 'TE-001',  'CRITICAL',     'demo-loc-elec',  'demo-sys-ele', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-018',  'EQ-018',     'Tablero Eléctrico TE-002',       'Tablero secundario sala de bombas',                              true,  'ELECTRICAL', 'TE-002',  'SEMICRITICAL', 'demo-loc-elec',  'demo-sys-ele', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-003',  'EQ-003',     'Motor Eléctrico ME-001',         'Motor trifásico 75 kW — accionamiento BC-001',                    true,  'MOTOR',      'ME-001',  'CRITICAL',     'demo-loc-elec',  'demo-sys-ele', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'),
  ('demo-eq-007',  'EQ-007',     'Generador Auxiliar GA-001',      'Generador diésel 200 kVA de respaldo',                            true,  'GENERATOR',  'GA-001',  'CRITICAL',     'demo-loc-yard',  'demo-sys-ele', 'demo-admin', '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z')
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
   'demo-company-2', 'demo-supervisor', 'demo-tech',     '2026-05-14T14:00:00Z', '2026-05-14T14:00:00Z'),

  -- ─── 20 OTs adicionales (Iter 7 10.C): distintos estados, equipos, fechas ─────────
  ('demo-wo-006', 'OT-2026-0006', 'PREVENTIVE', 'COMPLETED',        100,
   '2026-02-05T08:00:00Z', '08:00:00', 'Inspección anual tanque TK-001',  'Inspección de espesores y soldaduras',
   'MEDIUM', 'COMPLIANCE',    '2026-02-10T08:00:00Z', 16, 2, '2026-02-11T17:00:00Z',
   'demo-company-1',   'demo-supervisor',     'demo-tech',     '2026-02-05T08:00:00Z', '2026-02-11T17:30:00Z'),
  ('demo-wo-007', 'OT-2026-0007', 'CORRECTIVE', 'COMPLETED',        100,
   '2026-02-12T10:00:00Z', '10:00:00', 'Reemplazo válvula seguridad TK-003','Válvula de alivio fuera de calibración',
   'HIGH',   'MITIGATE_RISK', '2026-02-13T08:00:00Z', 6, 1, '2026-02-13T14:30:00Z',
   'demo-company-2',   'seed-supervisor-2',   'seed-user-001', '2026-02-12T10:00:00Z', '2026-02-13T14:30:00Z'),
  ('demo-wo-008', 'OT-2026-0008', 'PREDICTIVE', 'COMPLETED',        100,
   '2026-03-01T09:00:00Z', '09:00:00', 'Análisis vibraciones bombeo',     'Mediciones en BC-001 y BC-002',
   'LOW',    'CONFIDABILITY', '2026-03-05T08:00:00Z', 4, 1, '2026-03-05T12:00:00Z',
   NULL,               'demo-supervisor',     'seed-user-002', '2026-03-01T09:00:00Z', '2026-03-05T12:30:00Z'),
  ('demo-wo-009', 'OT-2026-0009', 'PREVENTIVE', 'COMPLETED',        100,
   '2026-03-10T08:30:00Z', '08:30:00', 'Cambio aceite compresor CP-001',  'Mantenimiento preventivo trimestral',
   'MEDIUM', 'CONFIDABILITY', '2026-03-15T08:00:00Z', 3, 1, '2026-03-15T11:00:00Z',
   'demo-company-1',   'demo-supervisor',     'demo-tech',     '2026-03-10T08:30:00Z', '2026-03-15T11:30:00Z'),
  ('demo-wo-010', 'OT-2026-0010', 'CORRECTIVE', 'COMPLETED',        100,
   '2026-03-18T14:00:00Z', '14:00:00', 'Reparación tablero TE-002',       'Disyuntor con disparos intermitentes',
   'HIGH',   'MITIGATE_RISK', '2026-03-19T08:00:00Z', 5, 1, '2026-03-19T13:00:00Z',
   'demo-company-1',   'seed-supervisor-3',   'seed-user-002', '2026-03-18T14:00:00Z', '2026-03-19T13:30:00Z'),
  ('demo-wo-011', 'OT-2026-0011', 'PREVENTIVE', 'COMPLETED',        100,
   '2026-03-25T08:00:00Z', '08:00:00', 'Limpieza intercambiador IC-003',  'Limpieza química de placas',
   'LOW',    'CONFIDABILITY', '2026-03-28T08:00:00Z', 8, 1, '2026-03-28T16:00:00Z',
   'demo-company-2',   'seed-supervisor-2',   'demo-tech',     '2026-03-25T08:00:00Z', '2026-03-28T16:30:00Z'),
  ('demo-wo-012', 'OT-2026-0012', 'PROACTIVE',  'COMPLETED',        100,
   '2026-04-02T09:00:00Z', '09:00:00', 'Revisión EPP y bloqueos',         'Auditoría de cumplimiento HSE',
   'MEDIUM', 'COMPLIANCE',    '2026-04-04T08:00:00Z', 4, 1, '2026-04-04T12:00:00Z',
   NULL,               'demo-supervisor',     'seed-user-001', '2026-04-02T09:00:00Z', '2026-04-04T12:30:00Z'),
  ('demo-wo-013', 'OT-2026-0013', 'PREVENTIVE', 'COMPLETED',        100,
   '2026-04-08T08:00:00Z', '08:00:00', 'Mantenimiento generador GA-001',  'Mantenimiento 500 horas',
   'MEDIUM', 'CONFIDABILITY', '2026-04-12T08:00:00Z', 6, 1, '2026-04-12T14:00:00Z',
   'demo-company-1',   'demo-supervisor',     'demo-tech',     '2026-04-08T08:00:00Z', '2026-04-12T14:30:00Z'),
  ('demo-wo-014', 'OT-2026-0014', 'CORRECTIVE', 'CANCELLED',          0,
   '2026-04-14T11:00:00Z', '11:00:00', 'Reemplazo motor ME-001',          'Cancelada — falsa alarma de bobinado',
   'HIGH',   'MITIGATE_RISK', '2026-04-16T08:00:00Z', 12, 2, '2026-04-17T17:00:00Z',
   'demo-company-1',   'demo-supervisor',     'demo-tech',     '2026-04-14T11:00:00Z', '2026-04-15T09:00:00Z'),

  ('demo-wo-015', 'OT-2026-0015', 'PREVENTIVE', 'PLANNED',            0,
   '2026-05-02T08:00:00Z', '08:00:00', 'Mantenimiento programado horno FH-001','Inspección refractarios y quemadores',
   'HIGH',   'CONFIDABILITY', '2026-05-25T07:00:00Z', 24, 3, '2026-05-27T17:00:00Z',
   'demo-company-2',   'seed-supervisor-2',   'demo-tech',     '2026-05-02T08:00:00Z', '2026-05-02T08:00:00Z'),
  ('demo-wo-016', 'OT-2026-0016', 'PREVENTIVE', 'PLANNED',            0,
   '2026-05-03T09:00:00Z', '09:00:00', 'Calibración instrumentación tanques','Calibración de transmisores de nivel',
   'MEDIUM', 'COMPLIANCE',    '2026-05-26T08:00:00Z', 8, 1, '2026-05-26T16:00:00Z',
   'demo-company-1',   'seed-supervisor-3',   'seed-user-001', '2026-05-03T09:00:00Z', '2026-05-03T09:00:00Z'),
  ('demo-wo-017', 'OT-2026-0017', 'PREDICTIVE', 'PLANNED',            0,
   '2026-05-05T10:00:00Z', '10:00:00', 'Inspección termográfica TE-001',  'Inspección termográfica trimestral',
   'LOW',    'CONFIDABILITY', '2026-05-28T08:00:00Z', 4, 1, '2026-05-28T12:00:00Z',
   NULL,               'demo-supervisor',     'seed-user-002', '2026-05-05T10:00:00Z', '2026-05-05T10:00:00Z'),
  ('demo-wo-018', 'OT-2026-0018', 'PREVENTIVE', 'PLANNED',            0,
   '2026-05-06T08:00:00Z', '08:00:00', 'Mantenimiento BC-003 (stand-by)', 'Rotación de bomba stand-by, pruebas operativas',
   'MEDIUM', 'CONFIDABILITY', '2026-05-30T08:00:00Z', 4, 1, '2026-05-30T12:00:00Z',
   'demo-company-1',   'demo-supervisor',     'demo-tech',     '2026-05-06T08:00:00Z', '2026-05-06T08:00:00Z'),
  ('demo-wo-019', 'OT-2026-0019', 'PROACTIVE',  'PLANNED',            0,
   '2026-05-07T11:00:00Z', '11:00:00', 'Simulacro emergencia derrame',    'Ejercicio anual con brigada de emergencia',
   'HIGH',   'COMPLIANCE',    '2026-06-05T09:00:00Z', 4, 1, '2026-06-05T13:00:00Z',
   NULL,               'demo-supervisor',     'demo-tech',     '2026-05-07T11:00:00Z', '2026-05-07T11:00:00Z'),

  ('demo-wo-020', 'OT-2026-0020', 'CORRECTIVE', 'IN_PROGRESS',       40,
   '2026-05-11T09:00:00Z', '09:00:00', 'Reparación fuga válvula TK-002',  'Fuga menor en válvula de fondo',
   'HIGH',   'MITIGATE_RISK', '2026-05-13T08:00:00Z', 6, 1, '2026-05-13T14:00:00Z',
   'demo-company-1',   'demo-supervisor',     'demo-tech',     '2026-05-11T09:00:00Z', '2026-05-13T08:30:00Z'),
  ('demo-wo-021', 'OT-2026-0021', 'PREVENTIVE', 'IN_PROGRESS',       60,
   '2026-05-12T08:30:00Z', '08:30:00', 'Mantenimiento programado CP-003', 'Cambio de aceite y filtros de aire',
   'MEDIUM', 'CONFIDABILITY', '2026-05-14T08:00:00Z', 4, 1, '2026-05-14T12:00:00Z',
   'demo-company-1',   'seed-supervisor-3',   'seed-user-001', '2026-05-12T08:30:00Z', '2026-05-14T11:00:00Z'),
  ('demo-wo-022', 'OT-2026-0022', 'PREDICTIVE', 'IN_PROGRESS',       30,
   '2026-05-13T14:00:00Z', '14:00:00', 'Análisis aceite BC-002',          'Toma de muestra y envío a laboratorio',
   'LOW',    'CONFIDABILITY', '2026-05-15T09:00:00Z', 2, 1, '2026-05-15T11:00:00Z',
   NULL,               'demo-supervisor',     'demo-tech',     '2026-05-13T14:00:00Z', '2026-05-15T10:00:00Z'),

  ('demo-wo-023', 'OT-2026-0023', 'CORRECTIVE', 'PENDING',           10,
   '2026-05-15T16:00:00Z', '16:00:00', 'Falla iluminación patio tanques', 'Luminarias intermitentes en sector C',
   'LOW',    'MITIGATE_RISK', '2026-05-22T08:00:00Z', 4, 1, '2026-05-22T12:00:00Z',
   'demo-company-2',   'seed-supervisor-2',   'seed-user-002', '2026-05-15T16:00:00Z', '2026-05-15T16:00:00Z'),
  ('demo-wo-024', 'OT-2026-0024', 'CORRECTIVE', 'PENDING',           20,
   '2026-05-16T09:30:00Z', '09:30:00', 'Reemplazo sello mecánico BC-002', 'Sello presenta fuga incipiente',
   'HIGH',   'MITIGATE_RISK', '2026-05-21T08:00:00Z', 8, 1, '2026-05-21T16:00:00Z',
   'demo-company-1',   'demo-supervisor',     'demo-tech',     '2026-05-16T09:30:00Z', '2026-05-16T09:30:00Z'),
  ('demo-wo-025', 'OT-2026-0025', 'PREVENTIVE', 'PLANNED',            0,
   '2026-05-17T08:00:00Z', '08:00:00', 'Inspección anual IC-002',         'Inspección termográfica y limpieza',
   'MEDIUM', 'CONFIDABILITY', '2026-06-02T08:00:00Z', 6, 1, '2026-06-02T14:00:00Z',
   'demo-company-2',   'seed-supervisor-2',   'seed-user-001', '2026-05-17T08:00:00Z', '2026-05-17T08:00:00Z')
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
   '2026-04-17T15:00:00Z', 'demo-admin', '2026-04-18T11:00:00Z', 'demo-admin'),

  -- ─── 5 permisos adicionales (Iter 7 10.C) ─────────────────────────────────
  ('demo-wp-004', 'COMPLETED', false,
   'Rodrigo Pizarro', 'ACHS', 'Patio de Tanques — TK-001', 'Inspección espesores',
   ARRAY['Equipo ultrasonido','EPP'],          ARRAY['Inspección visual','Permiso espacio confinado'],
   ARRAY['Medición de espesores de paredes'],  ARRAY['Atmósfera peligrosa','Caída a distinto nivel'], ARRAY['Vigía permanente','Detector de gases','Arnés'],
   false, true,
   '2026-02-10T08:00:00Z', '2026-02-11T17:00:00Z', '2026-02-08T10:00:00Z', '2026-02-11T17:30:00Z',
   'demo-wo-006', 'seed-supervisor-3', 'demo-company-1',
   '2026-02-09T11:00:00Z', 'demo-admin', '2026-02-11T17:30:00Z', 'demo-admin'),
  ('demo-wp-005', 'COMPLETED', true,
   'Patricia Soto', 'Mutual de Seguridad', 'Patio de Tanques — TK-003', 'Reemplazo válvula seguridad',
   ARRAY['Llaves de impacto','Equipo de bloqueo','Detector de gases'], ARRAY['Inspección visual','Verificación atmósfera'],
   ARRAY['Reemplazo válvula de alivio fuera de calibración'], ARRAY['Atmósfera peligrosa','Sobrepresión'], ARRAY['Detector continuo','Bloqueo y etiquetado','EPP ignífugo'],
   true, true,
   '2026-02-13T08:00:00Z', '2026-02-13T14:00:00Z', '2026-02-12T11:00:00Z', '2026-02-13T14:30:00Z',
   'demo-wo-007', 'seed-supervisor-2', 'demo-company-2',
   '2026-02-12T15:00:00Z', 'demo-admin', '2026-02-13T14:30:00Z', 'demo-admin'),
  ('demo-wp-006', 'COMPLETED', false,
   'Supervisor Demo', 'ACHS', 'Sala Eléctrica — TE-002', 'Trabajo eléctrico',
   ARRAY['Multímetro','EPP dieléctrico','Equipo de bloqueo'], ARRAY['Verificación tensión cero'],
   ARRAY['Diagnóstico y cambio de disyuntor'], ARRAY['Contacto eléctrico','Arco eléctrico'], ARRAY['EPP dieléctrico clase 2','Bloqueo y etiquetado'],
   false, true,
   '2026-03-19T08:00:00Z', '2026-03-19T13:00:00Z', '2026-03-18T15:00:00Z', '2026-03-19T13:30:00Z',
   'demo-wo-010', 'demo-supervisor', 'demo-company-1',
   '2026-03-18T17:00:00Z', 'demo-admin', '2026-03-19T13:30:00Z', 'demo-admin'),
  ('demo-wp-007', 'ACTIVE', false,
   'Supervisor Demo', 'ACHS', 'Patio de Tanques — TK-002', 'Reparación mecánica',
   ARRAY['Llaves','Equipo de bloqueo','Detector de gases'], ARRAY['Inspección visual','Charla de 5 minutos'],
   ARRAY['Sello de fondo de tanque presenta fuga menor'], ARRAY['Derrame','Atmósfera peligrosa'], ARRAY['Bandeja contención','Detector continuo'],
   false, true,
   '2026-05-13T08:00:00Z', '2026-05-13T14:00:00Z', '2026-05-12T16:00:00Z', '2026-05-12T16:00:00Z',
   'demo-wo-020', 'demo-supervisor', 'demo-company-1',
   '2026-05-12T18:00:00Z', 'demo-admin', NULL, NULL),
  ('demo-wp-008', 'REVIEW_PENDING', false,
   'Rodrigo Pizarro', 'ACHS', 'Sala de Bombas — BC-002', 'Mantenimiento mecánico',
   ARRAY['Llaves dinamométricas','Extractor','Equipo de bloqueo'], ARRAY['Inspección visual','Charla de 5 minutos'],
   ARRAY['Reemplazo de sello mecánico'], ARRAY['Atrapamiento','Caída a distinto nivel'], ARRAY['Bloqueo y etiquetado','Arnés'],
   false, true,
   '2026-05-21T08:00:00Z', '2026-05-21T16:00:00Z', '2026-05-17T10:00:00Z', '2026-05-17T10:00:00Z',
   'demo-wo-024', 'seed-supervisor-3', 'demo-company-1',
   NULL, NULL, NULL, NULL)
ON CONFLICT ("id") DO NOTHING;

-- ─── Work Permit ↔ participants (Prisma implicit M2N) ──────────────────────
-- Note: las entradas que referencian demo-worker-1/3/4 viven en un segundo
-- INSERT más abajo, después del bloque "Additional partner-company workers",
-- porque esos rows aún no existen en este punto del seed.
INSERT INTO "_WorkPermitParticipants" ("A", "B") VALUES
  ('demo-tech',        'demo-wp-001'),
  ('seed-user-001',    'demo-wp-001'),
  ('demo-tech',        'demo-wp-002'),
  ('seed-supervisor-2','demo-wp-003'),
  ('demo-tech',        'demo-wp-004'),
  ('seed-user-001',    'demo-wp-005'),
  ('seed-user-002',    'demo-wp-006'),
  ('demo-tech',        'demo-wp-007'),
  ('demo-tech',        'demo-wp-008')
ON CONFLICT DO NOTHING;

-- ─── Maintenance Plans + tasks ─────────────────────────────────────────────
INSERT INTO "maintenance_plan" ("id", "slug", "name", "description", "isActive", "equipmentId", "createdById", "createdAt", "updatedAt")
VALUES
  ('demo-mp-001', 'plan-bomba-centrifuga-bc001',  'Plan Bomba Centrífuga BC-001',   'Mantenimiento preventivo programado para BC-001',           true, 'demo-eq-001', 'demo-admin', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('demo-mp-002', 'plan-motor-electrico-me001',   'Plan Motor Eléctrico ME-001',    'Mantenimiento preventivo para ME-001 (75 kW)',              true, 'demo-eq-003', 'demo-admin', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z'),
  -- 10.D nuevos planes
  ('demo-mp-003', 'plan-sistema-compresion',      'Plan Sistema de Compresión',     'Mantenimiento integral del tren de compresión (CP-001/2/3)',true, 'demo-sys-cmp','demo-admin', '2026-02-20T10:00:00Z', '2026-02-20T10:00:00Z'),
  ('demo-mp-004', 'plan-patio-tanques',           'Plan Patio de Tanques',          'Inspecciones, calibración y limpieza patio de tanques',     true, 'demo-sys-tk', 'demo-admin', '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z'),
  ('demo-mp-005', 'plan-electrico-principal',     'Plan Sistema Eléctrico',         'Mantenimiento eléctrico y termografías programadas',        true, 'demo-sys-ele','demo-admin', '2026-03-10T10:00:00Z', '2026-03-10T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "maintenance_plan_task" (
  "id", "slug", "name", "description", "isActive", "frequency", "nextDate",
  "originalDayOfMonth", "isAutomated", "automatedDaysInAdvance",
  "blockIfPreviousNotCompleted", "emailsForCopy",
  "equipmentId", "maintenancePlanId", "createdById", "automatedResponsibleId",
  "createdAt", "updatedAt"
)
VALUES
  ('demo-mpt-001', 'inspeccion-vibraciones-bc-001', 'Inspección de vibraciones',   'Medición y análisis de vibraciones',         true, 'MONTHLY',   '2026-05-30T08:00:00Z', 30, true,  5, true, ARRAY[]::TEXT[], 'demo-eq-001', 'demo-mp-001', 'demo-admin', 'demo-tech', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('demo-mpt-002', 'cambio-sellos-bc-001',          'Cambio de sellos',            'Reemplazo de sellos mecánicos',              true, 'BIANNUAL',  '2026-07-15T08:00:00Z', 15, false, 7, true, ARRAY[]::TEXT[], 'demo-eq-001', 'demo-mp-001', 'demo-admin', 'demo-tech', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('demo-mpt-003', 'cambio-aceite-me-001',          'Cambio de aceite',            'Cambio de aceite y filtros',                 true, 'QUARTERLY', '2026-06-25T08:00:00Z', 25, true,  5, true, ARRAY[]::TEXT[], 'demo-eq-003', 'demo-mp-002', 'demo-admin', 'demo-tech', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z'),
  ('demo-mpt-004', 'termografia-me-001',            'Inspección termográfica',     'Termografía y análisis térmico',             true, 'MONTHLY',   '2026-05-28T08:00:00Z', 28, false, 5, true, ARRAY[]::TEXT[], 'demo-eq-003', 'demo-mp-002', 'demo-admin', 'demo-tech', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z'),
  -- 10.D nuevos tasks
  ('demo-mpt-005', 'cambio-aceite-cp-001',          'Cambio aceite CP-001',        'Cambio aceite y filtros compresor principal',true, 'QUARTERLY', '2026-06-10T08:00:00Z', 10, true,  5, true, ARRAY[]::TEXT[], 'demo-eq-002', 'demo-mp-003', 'demo-admin', 'demo-tech', '2026-02-20T10:00:00Z', '2026-02-20T10:00:00Z'),
  ('demo-mpt-006', 'inspeccion-vibraciones-cp-001', 'Inspección vibraciones CP-001','Medición vibraciones compresor principal',  true, 'MONTHLY',   '2026-06-01T08:00:00Z', 1,  true,  5, true, ARRAY[]::TEXT[], 'demo-eq-002', 'demo-mp-003', 'demo-admin', 'demo-tech', '2026-02-20T10:00:00Z', '2026-02-20T10:00:00Z'),
  ('demo-mpt-007', 'inspeccion-anual-tanques',      'Inspección anual tanques',    'Inspección visual y espesores tanques',      true, 'YEARLY',    '2027-02-10T08:00:00Z', 10, false, 30, true, ARRAY[]::TEXT[], 'demo-sys-tk', 'demo-mp-004', 'demo-admin', 'demo-tech', '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z'),
  ('demo-mpt-008', 'calibracion-instrumentacion',   'Calibración instrumentación', 'Calibración transmisores nivel patio tanques',true,'BIANNUAL', '2026-08-20T08:00:00Z', 20, false, 14, true, ARRAY[]::TEXT[], 'demo-sys-tk', 'demo-mp-004', 'demo-admin', 'seed-user-001', '2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z'),
  ('demo-mpt-009', 'termografia-tableros',          'Termografía tableros',        'Termografía tableros TE-001 y TE-002',       true, 'QUARTERLY', '2026-06-28T08:00:00Z', 28, false, 7, true, ARRAY[]::TEXT[], 'demo-sys-ele','demo-mp-005', 'demo-admin', 'seed-user-002', '2026-03-10T10:00:00Z', '2026-03-10T10:00:00Z'),
  ('demo-mpt-010', 'mantenimiento-generador',       'Mantenimiento generador',     'Mantenimiento programado 500 horas GA-001',  true, 'BIANNUAL',  '2026-10-12T08:00:00Z', 12, false, 14, true, ARRAY[]::TEXT[], 'demo-eq-007', 'demo-mp-005', 'demo-admin', 'demo-tech',     '2026-03-10T10:00:00Z', '2026-03-10T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "_MaintenancePlanTaskEquipments" ("A", "B") VALUES
  ('demo-eq-001', 'demo-mpt-001'),
  ('demo-eq-001', 'demo-mpt-002'),
  ('demo-eq-003', 'demo-mpt-003'),
  ('demo-eq-003', 'demo-mpt-004'),
  -- 10.D nuevos
  ('demo-eq-002', 'demo-mpt-005'),
  ('demo-eq-002', 'demo-mpt-006'),
  ('demo-eq-013', 'demo-mpt-007'),
  ('demo-eq-014', 'demo-mpt-007'),
  ('demo-eq-015', 'demo-mpt-007'),
  ('demo-eq-016', 'demo-mpt-007'),
  ('demo-eq-013', 'demo-mpt-008'),
  ('demo-eq-014', 'demo-mpt-008'),
  ('demo-eq-004', 'demo-mpt-009'),
  ('demo-eq-018', 'demo-mpt-009'),
  ('demo-eq-007', 'demo-mpt-010')
ON CONFLICT DO NOTHING;

-- ─── Work Requests + counter ────────────────────────────────────────────────
INSERT INTO "work_request_counter" ("id", "value") VALUES ('work-request-counter', 8)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "work_request" (
  "id", "requestNumber", "description", "isUrgent", "requestDate", "observations",
  "status", "workType", "userId", "createdAt", "updatedAt",
  "approvalDate", "approvalById"
)
VALUES
  ('demo-wr-001', 'REQ-2026-0001', 'Compresor secundario presenta ruido anormal',          true,  '2026-05-14T08:30:00Z', 'Detectado durante turno matutino',     'REPORTED',  'MECHANIC', 'demo-supervisor',    '2026-05-14T08:30:00Z', '2026-05-14T08:30:00Z', NULL,                   NULL),
  ('demo-wr-002', 'REQ-2026-0002', 'Solicitud limpieza tablero TG1',                       false, '2026-05-10T09:15:00Z', 'Limpieza preventiva trimestral',       'APPROVED',  'ELECTRIC', 'demo-supervisor',    '2026-05-10T09:15:00Z', '2026-05-11T11:00:00Z', '2026-05-11T11:00:00Z', 'demo-admin'),
  ('demo-wr-003', 'REQ-2026-0003', 'Revisión generador auxiliar tras prueba',              false, '2026-05-08T14:00:00Z', 'Posterior a prueba de carga',          'ATTENDED',  'MECHANIC', 'seed-supervisor-2',  '2026-05-08T14:00:00Z', '2026-05-09T16:00:00Z', '2026-05-09T16:00:00Z', 'demo-admin'),
  -- 10.C nuevos
  ('demo-wr-004', 'REQ-2026-0004', 'Vibración elevada en bomba BC-002',                    true,  '2026-05-13T09:45:00Z', 'Medida superior a umbral de alerta',   'APPROVED',  'MECHANIC', 'demo-supervisor',    '2026-05-13T09:45:00Z', '2026-05-13T13:00:00Z', '2026-05-13T13:00:00Z', 'demo-admin'),
  ('demo-wr-005', 'REQ-2026-0005', 'Fuga menor válvula fondo TK-002',                      true,  '2026-05-11T08:15:00Z', 'Detectada en ronda de inspección',     'ATTENDED',  'MECHANIC', 'seed-supervisor-3',  '2026-05-11T08:15:00Z', '2026-05-11T17:00:00Z', '2026-05-11T10:00:00Z', 'demo-admin'),
  ('demo-wr-006', 'REQ-2026-0006', 'Iluminación intermitente patio tanques sector C',      false, '2026-05-15T15:30:00Z', 'Reportado por turno noche',            'REPORTED',  'ELECTRIC', 'seed-supervisor-2',  '2026-05-15T15:30:00Z', '2026-05-15T15:30:00Z', NULL,                   NULL),
  ('demo-wr-007', 'REQ-2026-0007', 'Ruido cojinete en motor ME-001',                       false, '2026-05-09T11:20:00Z', 'Ruido leve, sin afectar operación',    'CANCELLED', 'MECHANIC', 'demo-supervisor',    '2026-05-09T11:20:00Z', '2026-05-14T16:00:00Z', '2026-05-14T16:00:00Z', 'demo-admin'),
  ('demo-wr-008', 'REQ-2026-0008', 'Solicitud calibración transmisores nivel TK-001/004',  false, '2026-05-03T10:00:00Z', 'Calibración programada anual',         'APPROVED',  'ELECTRIC', 'seed-supervisor-3',  '2026-05-03T10:00:00Z', '2026-05-04T09:00:00Z', '2026-05-04T09:00:00Z', 'demo-admin')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "_EquipmentToWorkRequest" ("A", "B") VALUES
  ('demo-eq-008', 'demo-wr-001'),
  ('demo-eq-004', 'demo-wr-002'),
  ('demo-eq-007', 'demo-wr-003'),
  ('demo-eq-009', 'demo-wr-004'),
  ('demo-eq-014', 'demo-wr-005'),
  ('demo-eq-013', 'demo-wr-006'),
  ('demo-eq-003', 'demo-wr-007'),
  ('demo-eq-013', 'demo-wr-008'),
  ('demo-eq-016', 'demo-wr-008')
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
  ('demo-eq-006', 'demo-wo-005'),
  -- 10.C nuevos
  ('demo-eq-013', 'demo-wo-006'),
  ('demo-eq-015', 'demo-wo-007'),
  ('demo-eq-001', 'demo-wo-008'),
  ('demo-eq-009', 'demo-wo-008'),
  ('demo-eq-002', 'demo-wo-009'),
  ('demo-eq-018', 'demo-wo-010'),
  ('demo-eq-011', 'demo-wo-011'),
  ('demo-eq-007', 'demo-wo-013'),
  ('demo-eq-003', 'demo-wo-014'),
  ('demo-eq-017', 'demo-wo-015'),
  ('demo-eq-013', 'demo-wo-016'),
  ('demo-eq-014', 'demo-wo-016'),
  ('demo-eq-015', 'demo-wo-016'),
  ('demo-eq-016', 'demo-wo-016'),
  ('demo-eq-004', 'demo-wo-017'),
  ('demo-eq-010', 'demo-wo-018'),
  ('demo-eq-014', 'demo-wo-020'),
  ('demo-eq-012', 'demo-wo-021'),
  ('demo-eq-009', 'demo-wo-022'),
  ('demo-eq-009', 'demo-wo-024'),
  ('demo-eq-005', 'demo-wo-025')
ON CONFLICT DO NOTHING;

-- ─── Vehicles ───────────────────────────────────────────────────────────────
INSERT INTO "vehicle" ("id", "plate", "model", "year", "brand", "type", "color", "isMain", "isActive", "companyId", "createdAt", "updatedAt") VALUES
  ('demo-vehicle-1', 'GHJK-21', 'Hilux',         2022, 'Toyota',     'TRUCK',      'Blanco', true,  true, 'demo-company-1', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('demo-vehicle-2', 'LPQR-58', 'NP300',         2021, 'Nissan',     'TRUCK',      'Gris',   false, true, 'demo-company-1', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z'),
  ('demo-vehicle-3', 'MNST-90', 'Ranger',        2023, 'Ford',       'TRUCK',      'Negro',  true,  true, 'demo-company-2', '2026-03-05T10:00:00Z', '2026-03-05T10:00:00Z'),
  ('demo-vehicle-4', 'BXKD-42', 'Sprinter 416',  2022, 'Mercedes',   'VAN',        'Blanco', false, true, 'demo-company-1', '2026-02-20T10:00:00Z', '2026-02-20T10:00:00Z'),
  ('demo-vehicle-5', 'TRGR-07', 'Grúa Pluma 25t', 2020, 'Liebherr',  'TRUCK',      'Amarillo',false, true, 'demo-company-1', '2026-03-12T10:00:00Z', '2026-03-12T10:00:00Z'),
  ('demo-vehicle-6', 'CLPK-83', 'L200 Katana',   2024, 'Mitsubishi', 'TRUCK',      'Rojo',   false, true, 'demo-company-2', '2026-04-02T10:00:00Z', '2026-04-02T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── Additional partner-company workers (for startup-folder demo) ───────────
INSERT INTO "user" ("id", "name", "email", "emailVerified", "rut", "role", "accessRole", "isSupervisor", "companyId", "createdAt", "updatedAt", "isActive")
VALUES
  ('demo-worker-1', 'Juan Pérez',      'juan.perez@petroaustral.cl',      true, '18.111.111-1', 'worker', 'PARTNER_COMPANY', false, 'demo-company-1', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z', true),
  ('demo-worker-2', 'María González',  'maria.gonzalez@petroaustral.cl',  true, '19.222.222-2', 'worker', 'PARTNER_COMPANY', false, 'demo-company-1', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z', true),
  ('demo-worker-3', 'Carlos Vega',     'carlos.vega@mantepatagonia.cl',   true, '20.333.333-3', 'driver', 'PARTNER_COMPANY', false, 'demo-company-2', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z', true),
  ('demo-worker-4', 'Francisca Riffo', 'francisca.riffo@petroaustral.cl', true, '22.555.555-5', 'worker', 'PARTNER_COMPANY', false, 'demo-company-1', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z', true),
  ('demo-worker-5', 'Ignacio Pavez',   'ignacio.pavez@mantepatagonia.cl', true, '23.666.666-6', 'worker', 'PARTNER_COMPANY', false, 'demo-company-2', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z', true),
  ('demo-worker-6', 'Camila Riquelme', 'camila.riquelme@mantepatagonia.cl', true, '24.777.777-7', 'driver', 'PARTNER_COMPANY', false, 'demo-company-2', '2026-02-10T10:00:00Z', '2026-02-10T10:00:00Z', true)
ON CONFLICT ("id") DO NOTHING;

-- ─── 10.C participants extra (referencian workers recién insertados arriba) ─
INSERT INTO "_WorkPermitParticipants" ("A", "B") VALUES
  ('demo-worker-1', 'demo-wp-004'),
  ('demo-worker-3', 'demo-wp-005'),
  ('demo-worker-4', 'demo-wp-007'),
  ('demo-worker-1', 'demo-wp-008')
ON CONFLICT DO NOTHING;

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

-- ─── 10.D — Worker folders adicionales (workers 4/5/6) ─────────────────────
INSERT INTO "worker_folders" ("id", "status", "additionalNotificationEmails", "isDriver", "workerId", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-wf-004', 'APPROVED', ARRAY[]::text[], false, 'demo-worker-4', 'demo-sf-001', '2026-01-25T10:00:00Z', '2026-03-15T10:00:00Z'),
  ('demo-wf-005', 'SUBMITTED',ARRAY[]::text[], false, 'demo-worker-5', 'demo-sf-003', '2026-02-15T10:00:00Z', '2026-04-05T10:00:00Z'),
  ('demo-wf-006', 'DRAFT',    ARRAY[]::text[], true,  'demo-worker-6', 'demo-sf-003', '2026-02-15T10:00:00Z', '2026-02-15T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "basic_folder" ("id", "status", "additionalNotificationEmails", "workerId", "startupFolderId", "createdAt", "updatedAt") VALUES
  ('demo-bf-005', 'APPROVED', ARRAY[]::text[], 'demo-worker-4', 'demo-sf-001', '2026-01-25T10:00:00Z', '2026-03-15T10:00:00Z'),
  ('demo-bf-006', 'SUBMITTED',ARRAY[]::text[], 'demo-worker-5', 'demo-sf-003', '2026-02-15T10:00:00Z', '2026-04-05T10:00:00Z'),
  ('demo-bf-007', 'DRAFT',    ARRAY[]::text[], 'demo-worker-6', 'demo-sf-003', '2026-02-15T10:00:00Z', '2026-02-15T10:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- ─── 10.D — Docs adicionales para enriquecer carpetas ──────────────────────
INSERT INTO "basic_document" ("id", "type", "name", "url", "category", "status", "expirationDate", "uploadedById", "folderId", "uploadedAt", "reviewedAt") VALUES
  ('demo-doc-b005', 'CONTRACT',    'Contrato Francisca Riffo',           'https://example.com/contract-fr.pdf',  'BASIC', 'APPROVED', '2027-01-01T00:00:00Z', 'demo-supervisor',     'demo-bf-005', '2026-01-26T10:00:00Z', '2026-02-05T10:00:00Z'),
  ('demo-doc-b006', 'INSURANCE',   'Seguro Francisca Riffo',             'https://example.com/insurance-fr.pdf', 'BASIC', 'APPROVED', '2026-12-31T00:00:00Z', 'demo-supervisor',     'demo-bf-005', '2026-01-26T10:00:00Z', '2026-02-05T10:00:00Z'),
  ('demo-doc-b007', 'PPE_RECEIPT', 'Entrega EPP Francisca Riffo',        'https://example.com/ppe-fr.pdf',       'BASIC', 'APPROVED', '2027-01-01T00:00:00Z', 'demo-supervisor',     'demo-bf-005', '2026-01-26T10:00:00Z', '2026-02-05T10:00:00Z'),
  ('demo-doc-b008', 'CONTRACT',    'Contrato Ignacio Pavez',             'https://example.com/contract-ip.pdf',  'BASIC', 'SUBMITTED','2027-02-01T00:00:00Z', 'seed-supervisor-2',   'demo-bf-006', '2026-03-10T10:00:00Z', NULL),
  ('demo-doc-b009', 'INSURANCE',   'Seguro Ignacio Pavez',               'https://example.com/insurance-ip.pdf', 'BASIC', 'SUBMITTED','2026-12-31T00:00:00Z', 'seed-supervisor-2',   'demo-bf-006', '2026-03-10T10:00:00Z', NULL)
ON CONFLICT ("id") DO NOTHING;

-- env_document: agregar a folders que estaban vacías
INSERT INTO "environment_document" ("id", "type", "name", "url", "category", "status", "uploadedById", "folderId", "uploadedAt", "submittedAt", "reviewedAt", "reviewNotes") VALUES
  ('demo-doc-e001', 'ENVIRONMENTAL_MANAGEMENT_PLAN',           'Plan de Gestión Ambiental',           'https://example.com/env-plan.pdf',   'ENVIRONMENTAL', 'DRAFT',     'demo-supervisor',   'demo-env-001', '2026-01-22T10:00:00Z', NULL,                    NULL,                    NULL),
  ('demo-doc-e002', 'ENVIRONMENTAL_ASPECTS_AND_IMPACTS_MATRIX','Matriz Aspectos e Impactos',          'https://example.com/matriz.pdf',     'ENVIRONMENTAL', 'SUBMITTED', 'seed-supervisor-2', 'demo-env-003', '2026-02-20T10:00:00Z', '2026-04-01T10:00:00Z',  NULL,                    NULL),
  ('demo-doc-e003', 'ENVIRONMENTAL_MANAGEMENT_PLAN',           'Plan Ambiental Anual 2026',           'https://example.com/env-2026.pdf',   'ENVIRONMENTAL', 'APPROVED',  'seed-supervisor-2', 'demo-env-003', '2026-02-20T10:00:00Z', '2026-03-10T10:00:00Z',  '2026-04-01T10:00:00Z',  NULL)
ON CONFLICT ("id") DO NOTHING;

-- safety: enriquecer demo-sah-003
INSERT INTO "safety_and_health_document" ("id", "type", "name", "url", "category", "status", "uploadedById", "folderId", "uploadedAt", "submittedAt", "reviewedAt", "reviewNotes") VALUES
  ('demo-doc-s003', 'COMPANY_INFO',     'Antecedentes Empresa MantePatagonia', 'https://example.com/co-mp.pdf',    'SAFETY_AND_HEALTH', 'APPROVED', 'seed-supervisor-2', 'demo-sah-003', '2026-02-20T10:00:00Z', '2026-03-01T10:00:00Z', '2026-03-20T10:00:00Z', NULL),
  ('demo-doc-s004', 'PREVENTION_PLAN',  'Plan Prevención de Riesgos',           'https://example.com/risk-mp.pdf',   'SAFETY_AND_HEALTH', 'APPROVED', 'seed-supervisor-2', 'demo-sah-003', '2026-02-20T10:00:00Z', '2026-03-01T10:00:00Z', '2026-03-20T10:00:00Z', NULL)
ON CONFLICT ("id") DO NOTHING;

-- tech_specs: agregar a demo-tech-003
INSERT INTO "tech_specs_document" ("id", "type", "name", "url", "category", "status", "uploadedById", "folderId", "uploadedAt", "reviewedAt") VALUES
  ('demo-doc-t002', 'TECHNICAL_WORK_PROCEDURE', 'Procedimiento Trabajo Mecánico', 'https://example.com/twp-mech.pdf', 'TECHNICAL_SPECS', 'DRAFT', 'seed-supervisor-2', 'demo-tech-003', '2026-02-18T10:00:00Z', NULL)
ON CONFLICT ("id") DO NOTHING;

-- worker_document: docs para worker folders (demo-wf-001 DRAFT, demo-wf-004 APPROVED)
INSERT INTO "worker_document" ("id", "type", "name", "url", "category", "status", "expirationDate", "uploadedById", "folderId", "uploadedAt", "reviewedAt") VALUES
  ('demo-doc-w001', 'HEALTH_EXAM',            'Examen Salud Juan Pérez',           'https://example.com/health-jp.pdf', 'PERSONNEL', 'DRAFT',    '2027-01-01T00:00:00Z', 'demo-supervisor', 'demo-wf-001', '2026-03-01T10:00:00Z', NULL),
  ('demo-doc-w002', 'HEALTH_EXAM',            'Examen Salud Francisca Riffo',      'https://example.com/health-fr.pdf', 'PERSONNEL', 'APPROVED', '2027-01-01T00:00:00Z', 'demo-supervisor', 'demo-wf-004', '2026-01-30T10:00:00Z', '2026-02-15T10:00:00Z'),
  ('demo-doc-w003', 'RISK_MATRIX_TRAINING',   'Capacitación Matriz de Riesgos FR', 'https://example.com/mtx-fr.pdf',    'PERSONNEL', 'APPROVED', '2027-01-01T00:00:00Z', 'demo-supervisor', 'demo-wf-004', '2026-01-30T10:00:00Z', '2026-02-15T10:00:00Z')
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

-- ─── Iter 7 — 10.A re-runnable rebrand (petroquímica / mantenimiento) ──────
-- Companies, locations, and seeded users were renamed. ON CONFLICT DO NOTHING above
-- skips them on already-seeded databases, so we explicitly UPDATE here.
UPDATE "company" SET "name" = 'PetroAustral Servicios Industriales SpA' WHERE id = 'demo-company-1';
UPDATE "company" SET "name" = 'MantePatagonia Petroquímica Ltda'        WHERE id = 'demo-company-2';

UPDATE "Location" SET "name" = 'Refinería Cabo Negro', "path" = 'Refinería Cabo Negro' WHERE id = 'demo-loc-1';
UPDATE "Location" SET "path" = 'Refinería Cabo Negro / Sala de Bombas' WHERE id = 'demo-loc-pump';
UPDATE "Location" SET "path" = 'Refinería Cabo Negro / Sala Eléctrica' WHERE id = 'demo-loc-elec';
UPDATE "Location" SET "path" = 'Refinería Cabo Negro / Patio Externo'  WHERE id = 'demo-loc-yard';

UPDATE "user" SET "email" = 'admin@cabonegro.cl'             WHERE id = 'demo-admin';
UPDATE "user" SET "email" = 'tecnico@cabonegro.cl'           WHERE id = 'demo-tech';
UPDATE "user" SET "email" = 'maria.fernandez@cabonegro.cl'   WHERE id = 'seed-user-001';
UPDATE "user" SET "email" = 'carlos.rojas@cabonegro.cl'      WHERE id = 'seed-user-002';
UPDATE "user" SET "email" = 'supervisor@petroaustral.cl'     WHERE id = 'demo-supervisor';
UPDATE "user" SET "email" = 'patricia.soto@mantepatagonia.cl' WHERE id = 'seed-supervisor-2';
UPDATE "user" SET "email" = 'juan.perez@petroaustral.cl'     WHERE id = 'demo-worker-1';
UPDATE "user" SET "email" = 'maria.gonzalez@petroaustral.cl' WHERE id = 'demo-worker-2';
UPDATE "user" SET "email" = 'carlos.vega@mantepatagonia.cl'  WHERE id = 'demo-worker-3';

-- ─── Iter 7 — 10.B re-runnable rebrand (equipos + jerarquía padre/hijo) ────
-- Re-link existing equipment to the new parent systems and updated locations.
UPDATE "equipment" SET "name" = 'Bomba Centrífuga BC-001',        "description" = 'Bomba principal de impulsión de crudo, 250 m3/h',     "locationId" = 'demo-loc-pump',  "parentId" = 'demo-sys-pmp' WHERE id = 'demo-eq-001';
UPDATE "equipment" SET "name" = 'Compresor Industrial CP-001',    "description" = 'Compresor de gas combustible 75 HP',                  "locationId" = 'demo-loc-comp',  "parentId" = 'demo-sys-cmp' WHERE id = 'demo-eq-002';
UPDATE "equipment" SET "name" = 'Motor Eléctrico ME-001',         "description" = 'Motor trifásico 75 kW — accionamiento BC-001',        "locationId" = 'demo-loc-elec',  "parentId" = 'demo-sys-ele' WHERE id = 'demo-eq-003';
UPDATE "equipment" SET "name" = 'Tablero Eléctrico TE-001',       "description" = 'Tablero general de distribución (TG1) 480V',          "locationId" = 'demo-loc-elec',  "parentId" = 'demo-sys-ele' WHERE id = 'demo-eq-004';
UPDATE "equipment" SET "name" = 'Intercambiador de Calor IC-002', "description" = 'Intercambiador tubular precalentador de crudo',       "locationId" = 'demo-loc-pump',  "parentId" = 'demo-sys-pmp' WHERE id = 'demo-eq-005';
UPDATE "equipment" SET "name" = 'Válvula Reguladora VR-001',      "description" = 'Válvula de control de flujo a compresor principal',   "locationId" = 'demo-loc-comp',  "parentId" = 'demo-sys-cmp' WHERE id = 'demo-eq-006';
UPDATE "equipment" SET "name" = 'Generador Auxiliar GA-001',      "description" = 'Generador diésel 200 kVA de respaldo',                "locationId" = 'demo-loc-yard',  "parentId" = 'demo-sys-ele' WHERE id = 'demo-eq-007';
UPDATE "equipment" SET "name" = 'Compresor de Respaldo CP-002',   "description" = 'Compresor de gas combustible secundario 50 HP',       "locationId" = 'demo-loc-comp',  "parentId" = 'demo-sys-cmp' WHERE id = 'demo-eq-008';

-- ─── Iter 7 — 10.C re-runnable bumps ──────────────────────────────────────
-- work_request_counter was 3 in earlier seeds; bump to 8 so newly-created requests
-- through the UI don't collide with REQ-2026-0004..0008 added in this batch.
UPDATE "work_request_counter" SET "value" = 8 WHERE id = 'work-request-counter' AND "value" < 8;

-- ─── 10.E — Safety talks: user_safety_talk + attempts + in-person records ──
-- 5 user_safety_talks asignados a workers/internos, en distintos estados.
INSERT INTO "user_safety_talk" (
  "id", "category", "status", "currentAttempts", "startedAt", "lastAttemptAt", "nextAttemptAt",
  "score", "minRequiredScore", "completedAt", "expiresAt", "manuallyApproved", "userId",
  "createdAt", "updatedAt"
)
VALUES
  ('demo-ust-001', 'IRL',         'PASSED',           1, '2026-02-10T09:00:00Z', '2026-02-10T09:25:00Z', NULL,                   90.0, 70.0, '2026-02-10T09:25:00Z', '2027-02-10T09:25:00Z', false, 'demo-worker-1', '2026-02-10T09:00:00Z', '2026-02-10T09:25:00Z'),
  ('demo-ust-002', 'IRL',         'PASSED',           2, '2026-03-05T10:00:00Z', '2026-03-12T10:30:00Z', NULL,                   80.0, 70.0, '2026-03-12T10:30:00Z', '2027-03-12T10:30:00Z', false, 'demo-worker-2', '2026-03-05T10:00:00Z', '2026-03-12T10:30:00Z'),
  ('demo-ust-003', 'VISITOR',     'IN_PROGRESS',      1, '2026-05-12T08:30:00Z', '2026-05-12T08:50:00Z', '2026-05-13T08:50:00Z', 60.0, 70.0, NULL,                   NULL,                   false, 'demo-worker-4', '2026-05-12T08:30:00Z', '2026-05-12T08:50:00Z'),
  ('demo-ust-004', 'ENVIRONMENT', 'PENDING',          0, NULL,                   NULL,                   NULL,                   NULL, 70.0, NULL,                   NULL,                   false, 'demo-worker-5', '2026-05-15T10:00:00Z', '2026-05-15T10:00:00Z'),
  ('demo-ust-005', 'IRL',         'MANUALLY_APPROVED',0, NULL,                   NULL,                   NULL,                   NULL, 70.0, '2026-04-20T12:00:00Z', '2027-04-20T12:00:00Z', true,  'demo-worker-3', '2026-04-20T11:00:00Z', '2026-04-20T12:00:00Z')
ON CONFLICT ("id") DO NOTHING;

UPDATE "user_safety_talk" SET "approvalById" = 'demo-admin' WHERE id = 'demo-ust-005';

-- Attempts: 1 successful + 1 failed-then-passed + 1 in-progress failed attempt.
INSERT INTO "safety_talk_attempt" (
  "id", "category", "score", "passed", "answers", "attemptNumber", "completedAt",
  "timeSpentSeconds", "userId", "userSafetyTalkId", "createdAt", "updatedAt"
)
VALUES
  ('demo-sta-001', 'IRL',     90.0, true,  '{"q1":"a","q2":"b","q3":"c","q4":"a","q5":"d"}'::jsonb, 1, '2026-02-10T09:25:00Z', 1500, 'demo-worker-1', 'demo-ust-001', '2026-02-10T09:25:00Z', '2026-02-10T09:25:00Z'),
  ('demo-sta-002', 'IRL',     50.0, false, '{"q1":"b","q2":"c","q3":"a"}'::jsonb,                  1, '2026-03-05T10:25:00Z', 1500, 'demo-worker-2', 'demo-ust-002', '2026-03-05T10:25:00Z', '2026-03-05T10:25:00Z'),
  ('demo-sta-003', 'IRL',     80.0, true,  '{"q1":"a","q2":"b","q3":"c","q4":"d","q5":"a"}'::jsonb, 2, '2026-03-12T10:30:00Z', 1300, 'demo-worker-2', 'demo-ust-002', '2026-03-12T10:30:00Z', '2026-03-12T10:30:00Z'),
  ('demo-sta-004', 'VISITOR', 60.0, false, '{"q1":"a","q2":"a","q3":"b"}'::jsonb,                  1, '2026-05-12T08:50:00Z', 1200, 'demo-worker-4', 'demo-ust-003', '2026-05-12T08:50:00Z', '2026-05-12T08:50:00Z')
ON CONFLICT ("id") DO NOTHING;

-- In-person safety talk records (charlas presenciales: visitas, contratistas IRL)
INSERT INTO "in_person_safety_talk_record" (
  "id", "rut", "name", "company", "category", "sessionDate", "expiresAt",
  "status", "score", "source", "notes", "registeredById", "createdAt", "updatedAt"
)
VALUES
  ('demo-ipstr-001', '25.111.222-3', 'Pedro Salazar',       'Servicios Externos Cabo Negro', 'IRL',         '2026-03-15T10:00:00Z', '2027-03-15T10:00:00Z', 'PASSED', 95.0, 'IMPORT', 'Charla presencial registrada por capacitador externo', 'demo-admin', '2026-03-15T10:00:00Z', '2026-03-15T10:00:00Z'),
  ('demo-ipstr-002', '26.222.333-4', 'Antonia Bravo',       'Auditoría TECNI SpA',           'VISITOR_TRM', '2026-04-02T09:30:00Z', '2026-10-02T09:30:00Z', 'PASSED', 80.0, 'MANUAL', 'Visita de auditoría',                                  'demo-admin', '2026-04-02T09:30:00Z', '2026-04-02T09:30:00Z'),
  ('demo-ipstr-003', '27.333.444-5', 'Sebastián Aravena',   'Visitante Independiente',       'VISITOR',     '2026-05-08T11:00:00Z', '2026-08-08T11:00:00Z', 'PASSED', 75.0, 'MANUAL', 'Visita técnica de proveedor',                          'demo-tech',  '2026-05-08T11:00:00Z', '2026-05-08T11:00:00Z')
ON CONFLICT ("id") DO NOTHING;
