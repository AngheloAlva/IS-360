export const OTC_INTERNAL_ROLES = {
  GENERAL_SUPERVISOR: "GENERAL_SUPERVISOR",
  AREA_SUPERVISOR: "AREA_SUPERVISOR",
  PREVENTION_OFFICER: "PREVENTION_OFFICER",
  OPERATIONS_MANAGER: "OPERATIONS_MANAGER",
  MAINTENANCE_SUPERVISOR: "MAINTENANCE_SUPERVISOR",
  ENVIRONMENTAL_SUPERVISOR: "ENVIRONMENTAL_SUPERVISOR",
  QUALITY_SUPERVISOR: "QUALITY_SUPERVISOR",
  NONE: "NONE",
} as const

export type OtcInternalRole = keyof typeof OTC_INTERNAL_ROLES

export const InternalRoleOptions = [
  {
    value: OTC_INTERNAL_ROLES.GENERAL_SUPERVISOR,
    label: "Supervisor General",
  },
  {
    value: OTC_INTERNAL_ROLES.AREA_SUPERVISOR,
    label: "Supervisor de Área",
  },
  {
    value: OTC_INTERNAL_ROLES.PREVENTION_OFFICER,
    label: "Oficial de Prevención",
  },
  {
    value: OTC_INTERNAL_ROLES.OPERATIONS_MANAGER,
    label: "Gerente de Operaciones",
  },
  {
    value: OTC_INTERNAL_ROLES.MAINTENANCE_SUPERVISOR,
    label: "Supervisor de Mantenimiento",
  },
  {
    value: OTC_INTERNAL_ROLES.ENVIRONMENTAL_SUPERVISOR,
    label: "Supervisor Ambiental",
  },
  {
    value: OTC_INTERNAL_ROLES.QUALITY_SUPERVISOR,
    label: "Supervisor de Calidad",
  },
  {
    value: OTC_INTERNAL_ROLES.NONE,
    label: "Ninguno",
  },
]
