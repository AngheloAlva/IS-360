import type { MODULES } from "@prisma/client"
import { SPECIAL_MODULES } from "@/lib/consts/modules"

/**
 * Verifica si un módulo es especial (no incluido con ALL)
 */
export function isSpecialModule(module: string): boolean {
	return SPECIAL_MODULES.includes(module as (typeof SPECIAL_MODULES)[number])
}

/**
 * Verifica si un usuario tiene acceso a un módulo especial específico
 */
export function hasSpecialModuleAccess(
	userModules: (MODULES | string)[],
	specialModule: string
): boolean {
	return userModules.includes(specialModule)
}

/**
 * Agrega módulos especiales a un usuario (para uso manual en BD)
 * Esta función puede ser usada en scripts de migración o asignación manual
 */
export function addSpecialModuleToUser(
	currentModules: (MODULES | string)[],
	specialModule: string
): (MODULES | string)[] {
	if (!isSpecialModule(specialModule)) {
		throw new Error(`${specialModule} no es un módulo especial válido`)
	}

	if (currentModules.includes(specialModule)) {
		return currentModules // Ya lo tiene
	}

	return [...currentModules, specialModule]
}

/**
 * Script de ejemplo para asignar REPORTABILITY_IS 360 a usuarios específicos
 *
 * Uso en BD:
 *
 * -- Asignar módulo especial a usuario específico
 * UPDATE "User"
 * SET "allowedModules" = array_append("allowedModules", 'REPORTABILITY_OTC'::text)
 * WHERE "email" = 'gerente@otc.cl';
 *
 * -- O si quieres reemplazar completamente los módulos:
 * UPDATE "User"
 * SET "allowedModules" = '{ALL,REPORTABILITY_OTC}'
 * WHERE "email" IN ('gerente@otc.cl', 'director@otc.cl');
 */
export const MANUAL_ASSIGNMENT_EXAMPLES = {
	REPORTABILITY_OTC: `
-- Asignar acceso a Reportabilidad IS 360
UPDATE "User" 
SET "allowedModules" = array_append("allowedModules", 'REPORTABILITY_OTC'::text)
WHERE "email" IN ('gerente@otc.cl', 'director@otc.cl');

-- Verificar asignación
SELECT "name", "email", "allowedModules" 
FROM "User" 
WHERE 'REPORTABILITY_OTC' = ANY("allowedModules");
	`.trim(),
}
