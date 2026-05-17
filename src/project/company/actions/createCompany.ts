import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { createStartupFolder } from "@/project/startup-folder/actions/createStartupFolder"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { CompanySchema } from "@/project/company/schemas/company.schema"

interface CreateCompanyProps {
	values: CompanySchema
}

interface CreateCompanyResponse {
	ok: boolean
	message: string
	data?: {
		id: string
	}
}

export const createCompany = async ({
	values,
}: CreateCompanyProps): Promise<CreateCompanyResponse> => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const {
			vehicles,
			supervisors,
			startupFolderName,
			startupFolderType,
			startupFolderMoreMonthDuration,
			...rest
		} = values

		const db = await getDemoDb()
		const existing = await db.query<{ id: string }>(
			`SELECT id FROM "company" WHERE rut = $1 LIMIT 1`,
			[rest.rut],
		)
		if (existing.rows.length) {
			return {
				ok: false,
				message:
					"Ya existe una empresa con el RUT proporcionado. Por favor, verifique el RUT o contacte con el soporte.",
			}
		}

		const companyId = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "company" (
				"id", "name", "rut", "isActive", "createdById", "createdAt", "updatedAt"
			) VALUES ($1, $2, $3, true, $4, $5, $5)`,
			[companyId, rest.name, rest.rut, user.id, now],
		)

		await logActivity({
			userId: user.id,
			module: MODULES.COMPANY,
			action: ACTIVITY_TYPE.CREATE,
			entityId: companyId,
			entityType: "Company",
			metadata: {
				name: rest.name,
				rut: rest.rut,
				hasVehicles: !!vehicles?.length,
				hasSupervisors: !!supervisors?.length,
			},
		})

		const { ok, message } = await createStartupFolder({
			companyId,
			type: startupFolderType,
			name: startupFolderName || "Carpeta de arranque",
			moreMonthDuration: startupFolderMoreMonthDuration || false,
		})

		if (vehicles?.length) {
			for (const v of vehicles) {
				const vehicleId = crypto.randomUUID()
				await db.query(
					`INSERT INTO "vehicle" (
						"id", "plate", "model", "year", "brand", "type", "color", "isMain",
						"isActive", "companyId", "createdAt", "updatedAt"
					) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10, $10)`,
					[
						vehicleId,
						v.plate,
						v.model,
						Number(v.year),
						v.brand,
						v.type,
						v.color ?? null,
						v.isMain ?? false,
						companyId,
						now,
					],
				)

				await logActivity({
					userId: user.id,
					module: MODULES.COMPANY,
					action: ACTIVITY_TYPE.CREATE,
					entityId: vehicleId,
					entityType: "Vehicle",
					metadata: {
						companyId,
						plate: v.plate,
						brand: v.brand,
						model: v.model,
						year: Number(v.year),
					},
				})
			}
		}

		if (!ok) {
			return { ok: false, message }
		}

		return {
			ok: true,
			message: "Empresa creada exitosamente",
			data: { id: companyId },
		}
	} catch (error) {
		console.error("[CREATE_COMPANY]", error)
		return { ok: false, message: "Error al crear la empresa" }
	}
}
