import type { MODULES } from "@prisma/client"

export const MODULE_ROUTE_MAP: Record<MODULES, string[]> = {
	ALL: [],
	HOME: ["/admin/dashboard/inicio", "/dashboard/inicio"],
	REPORTABILITY: ["/admin/dashboard/reportabilidad"],
	NOTIFICATIONS: ["/admin/dashboard/notificaciones"],
	TOOLS: ["/admin/dashboard/herramientas"],
	TUTORIALS: ["/admin/dashboard/tutoriales"],
	EQUIPMENT: ["/admin/dashboard/equipos", "/dashboard/vehiculos"],
	SAFETY_TALK: ["/admin/dashboard/charlas-de-seguridad", "/dashboard/charlas-de-seguridad"],
	WORK_ORDERS: ["/admin/dashboard/ordenes-de-trabajo", "/dashboard/libro-de-obras"],
	WORK_PERMITS: ["/admin/dashboard/permisos-de-trabajo", "/dashboard/permiso-de-trabajo"],
	LOCKOUT_PERMITS: ["/admin/dashboard/solicitudes-de-bloqueo"],
	DOCUMENTATION: ["/admin/dashboard/documentacion"],
	WORK_REQUESTS: ["/admin/dashboard/solicitudes-de-trabajo"],
	COMPANY: ["/admin/dashboard/empresas"],
	USERS: ["/admin/dashboard/usuarios", "/dashboard/colaboradores"],
	MAINTENANCE_PLANS: ["/admin/dashboard/planes-de-mantenimiento"],
	STARTUP_FOLDERS: ["/admin/dashboard/carpetas-de-arranques", "/dashboard/carpetas-de-arranque"],
	LABOR_CONTROL_FOLDERS: ["/admin/dashboard/control-laboral", "/dashboard/control-laboral"],
	VEHICLES: ["/dashboard/vehiculos"],

	CONTACT: [],
	NONE: [],
}

export function canAccessAdminRoute(userModules: MODULES[], route: string): boolean {
	if (!route.includes("/admin/dashboard/")) {
		return true
	}

	if (route.includes("/admin/dashboard/mi-cuenta")) {
		return true
	}

	if (userModules.includes("ALL")) {
		return true
	}

	for (const userModule of userModules) {
		const allowedRoutes = MODULE_ROUTE_MAP[userModule]
		if (allowedRoutes.some((allowedRoute) => route.includes(allowedRoute))) {
			return true
		}
	}

	return false
}

/**
 * Filtra los elementos del sidebar basándose en los módulos permitidos del usuario
 * Solo aplica para usuarios admin
 */
export function filterAdminSidebarItems<T extends { url: string }>(
	items: T[],
	userModules: MODULES[],
	isAdmin: boolean
): T[] {
	if (!isAdmin) {
		return items
	}

	if (userModules.includes("ALL")) {
		return items
	}

	return items.filter((item) => canAccessAdminRoute(userModules, item.url))
}
