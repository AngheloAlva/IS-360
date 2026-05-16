import { ReviewStatus } from "@/generated/prisma/enums"
import { getDemoDb } from "@/lib/demo-db/client"

interface GetCompanyEntitiesParams {
	companyId: string
	startupFolderId: string
}

interface SelectedEntity {
	id: string
	name: string
	status: ReviewStatus
}

export const getVehicleEntities = async ({
	companyId,
	startupFolderId,
}: GetCompanyEntitiesParams): Promise<{
	allEntities: SelectedEntity[]
	vinculatedEntities: SelectedEntity[]
}> => {
	try {
		const db = await getDemoDb()
		const linkedRes = await db.query<{
			id: string
			plate: string | null
			brand: string | null
			model: string | null
			status: ReviewStatus
		}>(
			`SELECT v.id, v.plate, v.brand, v.model, vf.status
			 FROM "vehicle_folders" vf
			 JOIN "vehicle" v ON v.id = vf."vehicleId"
			 WHERE vf."startupFolderId" = $1 AND v."companyId" = $2 AND v."isActive" = true
			 ORDER BY v.plate ASC`,
			[startupFolderId, companyId],
		)
		const linkedIds = linkedRes.rows.map((r) => r.id)

		const allRes = await db.query<{
			id: string
			plate: string | null
			brand: string | null
			model: string | null
		}>(
			linkedIds.length > 0
				? `SELECT id, plate, brand, model FROM "vehicle"
				   WHERE "companyId" = $1 AND "isActive" = true AND id <> ALL($2::text[])
				   ORDER BY plate ASC`
				: `SELECT id, plate, brand, model FROM "vehicle"
				   WHERE "companyId" = $1 AND "isActive" = true
				   ORDER BY plate ASC`,
			linkedIds.length > 0 ? [companyId, linkedIds] : [companyId],
		)

		return {
			allEntities: allRes.rows.map((v) => ({
				id: v.id,
				name: `${v.plate ?? ""} ${v.brand ?? ""} ${v.model ?? ""}`.trim(),
				status: ReviewStatus.DRAFT,
			})),
			vinculatedEntities: linkedRes.rows.map((v) => ({
				id: v.id,
				name: `${v.plate ?? ""} - ${v.brand ?? ""} - ${v.model ?? ""}`,
				status: v.status,
			})),
		}
	} catch (error) {
		console.error("Error fetching vehicle entities:", error)
		throw new Error("Error fetching vehicle entities")
	}
}
