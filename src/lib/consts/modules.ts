import { MODULES } from "@prisma/client"

export const ModulesValuesArray = [
	MODULES.ALL, // Todo
	MODULES.EQUIPMENT, // Equipos y Ubicacioens
	MODULES.SAFETY_TALK, // Charlas de seguridad
	MODULES.WORK_ORDERS, // Ordenes de Trabajo y Libros de obras
	MODULES.WORK_PERMITS, // Permisos de Trabajo
	MODULES.DOCUMENTATION, // Documentacion
	MODULES.WORK_REQUESTS, // Solicitudes de Trabajo
	MODULES.COMPANY, // Empresas
	MODULES.USERS, // Usuarios
	MODULES.MAINTENANCE_PLANS, // Planes de Mantenimiento y Tareas de los planes
	MODULES.STARTUP_FOLDERS, // Carpetas de Arranque
	MODULES.VEHICLES, // Vehiculos (acceso contratista, no OTC)
	MODULES.CONTACT, // Contacto y Soporte
	MODULES.NONE, // Sin módulo
] as const

export const ModuleOptions = [
	{
		value: MODULES.ALL,
		label: "Todos",
	},
	{
		value: MODULES.EQUIPMENT,
		label: "Equipos",
	},
	{
		value: MODULES.SAFETY_TALK,
		label: "Charlas de seguridad",
	},
	{
		value: MODULES.WORK_ORDERS,
		label: "Ordenes de trabajo",
	},
	{
		value: MODULES.WORK_PERMITS,
		label: "Permisos de trabajo",
	},
	{
		value: MODULES.DOCUMENTATION,
		label: "Documentacion",
	},
	{
		value: MODULES.NONE,
		label: "Ninguno",
	},
]

export const ModulesLabels = {
	[MODULES.ALL]: "Todos",
	[MODULES.EQUIPMENT]: "Equipos",
	[MODULES.SAFETY_TALK]: "Charlas de seguridad",
	[MODULES.WORK_ORDERS]: "Ordenes de trabajo",
	[MODULES.WORK_PERMITS]: "Permisos de trabajo",
	[MODULES.DOCUMENTATION]: "Documentacion",
	[MODULES.WORK_REQUESTS]: "Solicitudes de trabajo",
	[MODULES.COMPANY]: "Empresas",
	[MODULES.USERS]: "Usuarios",
	[MODULES.MAINTENANCE_PLANS]: "Planes de mantenimiento",
	[MODULES.STARTUP_FOLDERS]: "Carpetas de arranque",
	[MODULES.VEHICLES]: "Vehículos",
	[MODULES.CONTACT]: "Contacto y soporte",
	[MODULES.NONE]: "Ninguno",
}
