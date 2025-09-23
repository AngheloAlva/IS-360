import { MODULES } from "@prisma/client"

export const ModulesValuesArray = [
	MODULES.ALL, // Todo
	MODULES.HOME, // Inicio
	MODULES.REPORTABILITY, // Reportabilidad
	MODULES.NOTIFICATIONS, // Notificaciones
	MODULES.TOOLS, // Herramientas
	MODULES.TUTORIALS, // Tutoriales
	MODULES.EQUIPMENT, // Equipos y Ubicacioens
	MODULES.SAFETY_TALK, // Charlas de seguridad
	MODULES.WORK_ORDERS, // Ordenes de Trabajo y Libros de obras
	MODULES.WORK_PERMITS, // Permisos de Trabajo
	MODULES.LOCKOUT_PERMITS, // Permisos de Bloqueo
	MODULES.DOCUMENTATION, // Documentacion
	MODULES.WORK_REQUESTS, // Solicitudes de Trabajo
	MODULES.COMPANY, // Empresas
	MODULES.USERS, // Usuarios
	MODULES.MAINTENANCE_PLANS, // Planes de Mantenimiento y Tareas de los planes
	MODULES.STARTUP_FOLDERS, // Carpetas de Arranque
	MODULES.LABOR_CONTROL_FOLDERS, // Control de contratistas
	MODULES.VEHICLES, // Vehiculos (acceso contratista, no OTC)
	MODULES.CONTACT, // Contacto y Soporte
	MODULES.NONE, // Sin módulo
] as const

export const ModuleOptions = [
	{
		value: MODULES.ALL,
		label: "Acceso Completo",
	},
	{
		value: MODULES.HOME,
		label: "Inicio",
	},
	{
		value: MODULES.REPORTABILITY,
		label: "Reportabilidad",
	},
	{
		value: MODULES.NOTIFICATIONS,
		label: "Notificaciones",
	},
	{
		value: MODULES.TOOLS,
		label: "Herramientas",
	},
	{
		value: MODULES.TUTORIALS,
		label: "Tutoriales",
	},
	{
		value: MODULES.WORK_ORDERS,
		label: "Órdenes de Trabajo",
	},
	{
		value: MODULES.WORK_PERMITS,
		label: "Permisos de Trabajo",
	},
	{
		value: MODULES.SAFETY_TALK,
		label: "Charlas de Seguridad",
	},
	{
		value: MODULES.STARTUP_FOLDERS,
		label: "Carpetas de Arranque",
	},
	{
		value: MODULES.LABOR_CONTROL_FOLDERS,
		label: "Control Laboral",
	},
	{
		value: MODULES.DOCUMENTATION,
		label: "Documentación",
	},
	{
		value: MODULES.EQUIPMENT,
		label: "Equipos y Ubicaciones",
	},
	{
		value: MODULES.MAINTENANCE_PLANS,
		label: "Planes de Mantenimiento",
	},
	{
		value: MODULES.COMPANY,
		label: "Empresas",
	},
	{
		value: MODULES.USERS,
		label: "Usuarios",
	},
	{
		value: MODULES.WORK_REQUESTS,
		label: "Solicitudes de Trabajo",
	},
	{
		value: MODULES.LOCKOUT_PERMITS,
		label: "Permisos de Bloqueo",
	},
]

export const ModulesLabels = {
	[MODULES.ALL]: "Acceso Completo",
	[MODULES.WORK_ORDERS]: "Órdenes de Trabajo",
	[MODULES.WORK_PERMITS]: "Permisos de Trabajo",
	[MODULES.SAFETY_TALK]: "Charlas de Seguridad",
	[MODULES.STARTUP_FOLDERS]: "Carpetas de Arranque",
	[MODULES.LABOR_CONTROL_FOLDERS]: "Control Laboral",
	[MODULES.DOCUMENTATION]: "Documentación",
	[MODULES.EQUIPMENT]: "Equipos y Ubicaciones",
	[MODULES.MAINTENANCE_PLANS]: "Planes de Mantenimiento",
	[MODULES.COMPANY]: "Empresas",
	[MODULES.USERS]: "Usuarios",
	[MODULES.WORK_REQUESTS]: "Solicitudes de Trabajo",
	[MODULES.LOCKOUT_PERMITS]: "Permisos de Bloqueo",
	[MODULES.VEHICLES]: "Vehículos",
	[MODULES.CONTACT]: "Contacto y Soporte",
	[MODULES.NONE]: "Ninguno",
}
