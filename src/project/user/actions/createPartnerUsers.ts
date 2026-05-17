import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { linkEntity } from "@/project/startup-folder/actions/link-entity"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { sendNewUserEmail } from "@/project/user/actions/sendNewUserEmail"

interface PartnerUserInput {
	rut: string
	name: string
	email: string
	phone?: string
	internalRole?: string
	internalArea?: string
	isSupervisor?: boolean
	startupFoldersId?: string[]
}

interface PartnerUserResult {
	ok: boolean
	email: string
	name: string
	rut: string
	id?: string
	message?: string
}

export interface CreatePartnerUsersResult {
	ok: boolean
	message?: string
	results: PartnerUserResult[]
	successCount: number
	errorCount: number
}

export async function createPartnerUsers({
	companyId,
	users,
}: {
	companyId: string
	users: PartnerUserInput[]
}): Promise<CreatePartnerUsersResult> {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return {
			ok: false,
			message: "No autorizado",
			results: [],
			successCount: 0,
			errorCount: users.length,
		}
	}

	const db = await getDemoDb()
	const results: PartnerUserResult[] = []

	for (const u of users) {
		const email = u.email.trim().toLowerCase()
		try {
			const existing = await db.query<{ id: string }>(
				`SELECT id FROM "user" WHERE email = $1 OR rut = $2 LIMIT 1`,
				[email, u.rut],
			)
			if (existing.rows.length) {
				results.push({
					ok: false,
					email,
					name: u.name,
					rut: u.rut,
					message: `El RUT ${u.rut} o correo ${email} ya existe`,
				})
				continue
			}

			const newUserId = crypto.randomUUID()
			const now = new Date().toISOString()
			const temporalPassword = generateTemporalPassword()

			await db.query(
				`INSERT INTO "user" (
					"id", "name", "email", "emailVerified", "rut", "phone",
					"role", "accessRole", "internalRole", "internalArea",
					"companyId", "isSupervisor", "isActive",
					"createdAt", "updatedAt"
				) VALUES (
					$1, $2, $3, true, $4, $5,
					'partnerCompany', 'PARTNER_COMPANY', $6, $7,
					$8, $9, true,
					$10, $10
				)`,
				[
					newUserId,
					u.name,
					email,
					u.rut,
					u.phone ?? null,
					u.internalRole ?? null,
					u.internalArea ?? null,
					companyId,
					u.isSupervisor ?? false,
					now,
				],
			)

			if (u.startupFoldersId?.length) {
				for (const folderId of u.startupFoldersId) {
					await linkEntity({
						entityId: newUserId,
						startupFolderId: folderId,
						entityCategory: "PERSONNEL",
					})
				}
			}

			await logActivity({
				userId: sessionUser.id,
				module: MODULES.USERS,
				action: ACTIVITY_TYPE.ASSIGN,
				entityId: newUserId,
				entityType: "User",
				metadata: {
					type: "partner-user-create",
					email,
					name: u.name,
					companyId,
					isSupervisor: u.isSupervisor ?? false,
					internalRole: u.internalRole,
					internalArea: u.internalArea,
					startupFoldersId: u.startupFoldersId ?? [],
				},
			})

			void sendNewUserEmail({
				name: u.name,
				email,
				password: temporalPassword,
			})

			results.push({ ok: true, email, name: u.name, rut: u.rut, id: newUserId })
		} catch (error) {
			console.error("[CREATE_PARTNER_USERS]", { email, error })
			results.push({
				ok: false,
				email,
				name: u.name,
				rut: u.rut,
				message: "Error al crear el usuario",
			})
		}
	}

	const successCount = results.filter((r) => r.ok).length
	const errorCount = results.length - successCount
	return { ok: errorCount === 0, results, successCount, errorCount }
}
