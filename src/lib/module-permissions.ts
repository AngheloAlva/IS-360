import { SPECIAL_MODULES } from "@/lib/consts/modules"

import type { MODULES } from "@prisma/client"

export const MODULE_ROUTE_MAP: Record<MODULES | string, string[]> = {
	ALL: [],
	HOME: ["/admin/dashboard/inicio"],
	WORK_ORDERS: ["/admin/dashboard/ordenes-de-trabajo"],
	WORK_PERMITS: ["/admin/dashboard/permisos-de-trabajo"],
	SAFETY_TALK: ["/admin/dashboard/charlas-de-seguridad"],
	STARTUP_FOLDERS: ["/admin/dashboard/carpetas-de-arranques"],
	LABOR_CONTROL_FOLDERS: ["/admin/dashboard/control-laboral"],
	DOCUMENTATION: ["/admin/dashboard/documentacion"],
	EQUIPMENT: ["/admin/dashboard/equipos"],
	MAINTENANCE_PLANS: ["/admin/dashboard/planes-de-mantenimiento"],
	COMPANY: ["/admin/dashboard/empresas"],
	USERS: ["/admin/dashboard/usuarios"],
	WORK_REQUESTS: ["/admin/dashboard/solicitudes-de-trabajo"],
	LOCKOUT_PERMITS: ["/admin/dashboard/permisos-de-bloqueo"],
	VEHICLES: ["/dashboard/vehiculos"],
	REPORTABILITY: ["/admin/dashboard/reportabilidad"],
	REPORTABILITY_OTC: ["/admin/dashboard/reportabilidad-otc"],
	NOTIFICATIONS: ["/admin/dashboard/notificaciones"],
	TOOLS: ["/admin/dashboard/herramientas"],
	TUTORIALS: ["/admin/dashboard/tutoriales"],

	CONTACT: [],
	NONE: [],
}

export function canAccessAdminRoute(userModules: (MODULES | string)[], route: string): boolean {
	if (!route.includes("/admin/dashboard/")) {
		return true
	}

	// Siempre permitir acceso a mi cuenta
	if (route.includes("/admin/dashboard/mi-cuenta")) {
		return true
	}

	// Verificar si es una ruta de módulo especial
	const isSpecialModuleRoute = SPECIAL_MODULES.some((specialModule) => {
		const routes = MODULE_ROUTE_MAP[specialModule]
		return routes?.some((routePath) => route.includes(routePath))
	})

	// Si es una ruta de módulo especial, solo permitir si específicamente lo tiene
	if (isSpecialModuleRoute) {
		for (const userModule of userModules) {
			const allowedRoutes = MODULE_ROUTE_MAP[userModule]
			if (allowedRoutes?.some((allowedRoute) => route.includes(allowedRoute))) {
				return true
			}
		}
		return false
	}

	// Para rutas normales, permitir con ALL
	if (userModules.includes("ALL")) {
		return true
	}

	for (const userModule of userModules) {
		const allowedRoutes = MODULE_ROUTE_MAP[userModule]
		if (allowedRoutes?.some((allowedRoute) => route.includes(allowedRoute))) {
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
	userModules: (MODULES | string)[],
	isAdmin: boolean
): T[] {
	if (!isAdmin) {
		return items
	}

	return items.filter((item) => {
		// Verificar si es una ruta de módulo especial
		const isSpecialModuleRoute = SPECIAL_MODULES.some((specialModule) => {
			const routes = MODULE_ROUTE_MAP[specialModule]
			return routes?.some((routePath) => item.url.includes(routePath))
		})

		// Si es módulo especial, solo mostrar si específicamente lo tiene
		if (isSpecialModuleRoute) {
			return userModules.some((userModule) => {
				const allowedRoutes = MODULE_ROUTE_MAP[userModule]
				return allowedRoutes?.some((allowedRoute) => item.url.includes(allowedRoute))
			})
		}

		// Para módulos normales, aplicar lógica estándar
		if (userModules.includes("ALL")) {
			return true
		}

		return canAccessAdminRoute(userModules, item.url)
	})
}

/**
 * Obtiene la mejor ruta de redirección para un usuario basándose en sus módulos permitidos
 */
export function getBestRedirectRoute(userModules: (MODULES | string)[]): string {
	// Si tiene acceso completo, ir a inicio
	if (userModules.includes("ALL")) {
		return "/admin/dashboard/inicio"
	}

	// Definir orden de prioridad de rutas
	const priorityRoutes = [
		{ module: "HOME", route: "/admin/dashboard/inicio" },
		{ module: "WORK_ORDERS", route: "/admin/dashboard/ordenes-de-trabajo" },
		{ module: "WORK_PERMITS", route: "/admin/dashboard/permisos-de-trabajo" },
		{ module: "SAFETY_TALK", route: "/admin/dashboard/charlas-de-seguridad" },
		{ module: "STARTUP_FOLDERS", route: "/admin/dashboard/carpetas-de-arranques" },
		{ module: "LABOR_CONTROL_FOLDERS", route: "/admin/dashboard/control-laboral" },
		{ module: "DOCUMENTATION", route: "/admin/dashboard/documentacion" },
		{ module: "EQUIPMENT", route: "/admin/dashboard/equipos" },
		{ module: "MAINTENANCE_PLANS", route: "/admin/dashboard/planes-de-mantenimiento" },
		{ module: "COMPANY", route: "/admin/dashboard/empresas" },
		{ module: "USERS", route: "/admin/dashboard/usuarios" },
	] as const

	// Buscar el primer módulo disponible en orden de prioridad
	for (const { module, route } of priorityRoutes) {
		if (userModules.includes(module)) {
			return route
		}
	}

	// Si no tiene ningún módulo específico, al menos puede acceder a inicio
	return "/admin/dashboard/inicio"
}
