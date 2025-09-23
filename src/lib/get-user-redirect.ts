import type { MODULES } from "@prisma/client"
import { getBestRedirectRoute, canAccessAdminRoute } from "@/lib/module-permissions"

/**
 * Verifica si un usuario admin puede acceder a la página de inicio
 */
export function canAccessHome(allowedModules: (MODULES | string)[]): boolean {
	return canAccessAdminRoute(allowedModules, "/admin/dashboard/inicio")
}

/**
 * Obtiene la ruta de redirección después del login basándose en el rol y módulos del usuario
 */
export function getUserRedirectRoute(
	accessRole: "ADMIN" | "PARTNER_COMPANY",
	allowedModules?: (MODULES | string)[]
): string {
	// Usuarios de empresas externas van a su dashboard
	if (accessRole === "PARTNER_COMPANY") {
		return "/dashboard/inicio"
	}

	// Administradores van según sus módulos permitidos
	if (accessRole === "ADMIN") {
		const modules = allowedModules || ["ALL"]
		
		// Si puede acceder a home, ir ahí
		if (canAccessHome(modules)) {
			return "/admin/dashboard/inicio"
		}
		
		// Si no, ir a la mejor ruta disponible
		return getBestRedirectRoute(modules)
	}

	// Fallback por defecto (no debería llegar aquí)
	return "/admin/dashboard/inicio"
}

/**
 * Determina si un usuario debe ser redirigido después del login
 * y devuelve la URL de redirección apropiada
 */
export function getPostLoginRedirect(session: {
	user: {
		accessRole: "ADMIN" | "PARTNER_COMPANY"
		allowedModules?: (MODULES | string)[]
	}
}): string {
	return getUserRedirectRoute(
		session.user.accessRole,
		session.user.allowedModules
	)
}
