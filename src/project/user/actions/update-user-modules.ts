import { z } from "zod"

import { ACTIVITY_SEVERITY, ACTIVITY_TYPE, type MODULES } from "@/generated/prisma/enums"
import { createDiff } from "@/lib/activity/diff"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

const updateUserModulesSchema = z.object({
	userId: z.string().min(1, "ID de usuario requerido"),
	allowedModules: z
		.array(
			z.enum([
				"ALL",
				"EQUIPMENT",
				"SAFETY_TALK",
				"WORK_ORDERS",
				"WORK_PERMITS",
				"LOCKOUT_PERMITS",
				"DOCUMENTATION",
				"WORK_REQUESTS",
				"COMPANY",
				"USERS",
				"MAINTENANCE_PLANS",
				"STARTUP_FOLDERS",
				"LABOR_CONTROL_FOLDERS",
				"VEHICLES",
				"CONTACT",
				"NONE",
			] as const),
		)
		.min(1, "Debe seleccionar al menos un módulo"),
})

export type UpdateUserModulesInput = z.infer<typeof updateUserModulesSchema>

export async function updateUserModules(input: UpdateUserModulesInput) {
	try {
		const validated = updateUserModulesSchema.parse(input)
		const sessionUser = getDemoUser()
		if (!sessionUser) {
			throw new Error("No autenticado")
		}
		if (sessionUser.accessRole !== "ADMIN") {
			throw new Error("No tienes permisos para realizar esta acción")
		}

		const db = await getDemoDb()
		const targetRes = await db.query<{
			id: string
			name: string
			email: string
			allowedModules: string[]
		}>(
			`SELECT id, name, email, "allowedModules" FROM "user" WHERE id = $1`,
			[validated.userId],
		)
		const target = targetRes.rows[0]
		if (!target) {
			throw new Error("Usuario no encontrado")
		}

		const previousModules = target.allowedModules
		const now = new Date().toISOString()

		const updateRes = await db.query<{
			id: string
			name: string
			email: string
			allowedModules: string[]
		}>(
			`UPDATE "user"
			 SET "allowedModules" = $1, "updatedAt" = $2
			 WHERE id = $3
			 RETURNING id, name, email, "allowedModules"`,
			[validated.allowedModules as MODULES[], now, validated.userId],
		)
		const updatedUser = updateRes.rows[0]

		const diff = createDiff(
			{ allowedModules: previousModules },
			{ allowedModules: updatedUser.allowedModules },
		)

		await logActivity({
			userId: sessionUser.id,
			module: "USERS" as MODULES,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: updatedUser.id,
			entityType: "User",
			severity: ACTIVITY_SEVERITY.CRITICAL,
			...diff,
			metadata: { changedBy: sessionUser.id, targetEmail: target.email },
		})

		return {
			success: true,
			user: updatedUser,
			message: `Módulos actualizados correctamente para ${target.name}`,
		}
	} catch (error) {
		console.error("[UPDATE_USER_MODULES_ERROR]", error)
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: "Datos de entrada inválidos",
				details: error.issues,
			}
		}
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error desconocido",
		}
	}
}

/**
 * Obtiene la lista de módulos disponibles con sus descripciones
 */
export function getAvailableModules() {
	return [
		{ value: "ALL", label: "Acceso Completo", description: "Acceso a todos los módulos del sistema" },
		{ value: "WORK_ORDERS", label: "Órdenes de Trabajo", description: "Gestión de órdenes de trabajo y libros de obras" },
		{ value: "WORK_PERMITS", label: "Permisos de Trabajo", description: "Creación y gestión de permisos de trabajo" },
		{ value: "SAFETY_TALK", label: "Charlas de Seguridad", description: "Gestión de charlas y certificaciones de seguridad" },
		{ value: "STARTUP_FOLDERS", label: "Carpetas de Arranque", description: "Validación de documentación de arranque" },
		{ value: "LABOR_CONTROL_FOLDERS", label: "Control Laboral", description: "Control de trabajadores contratistas" },
		{ value: "DOCUMENTATION", label: "Documentación", description: "Gestión de biblioteca documental" },
		{ value: "EQUIPMENT", label: "Equipos y Ubicaciones", description: "Gestión de equipos industriales" },
		{ value: "MAINTENANCE_PLANS", label: "Planes de Mantenimiento", description: "Programación de mantenimiento preventivo" },
		{ value: "COMPANY", label: "Empresas", description: "Registro de empresas contratistas" },
		{ value: "USERS", label: "Usuarios", description: "Gestión de usuarios del sistema" },
		{ value: "WORK_REQUESTS", label: "Solicitudes de Trabajo", description: "Evaluación de solicitudes de trabajo" },
		{ value: "LOCKOUT_PERMITS", label: "Permisos de Bloqueo", description: "Gestión de bloqueos de energía" },
		{ value: "VEHICLES", label: "Vehículos", description: "Registro de vehículos de contratistas" },
		{ value: "NONE", label: "Sin Acceso", description: "Sin acceso a módulos operacionales" },
	] as const
}
