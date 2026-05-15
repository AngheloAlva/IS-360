"use server"

import { headers } from "next/headers"
import { z } from "zod"

import {
	inPersonSafetyTalkSchema,
	type InPersonSafetyTalkSchema,
} from "../schemas/in-person-safety-talk.schema"
import { normalizeRut } from "../utils/normalize-rut"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function registerInPersonSafetyTalk(data: InPersonSafetyTalkSchema) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const validatedData = inPersonSafetyTalkSchema.parse(data)

		const expiresAt =
			validatedData.expiresAt ??
			new Date(validatedData.sessionDate.getTime() + 365 * 24 * 60 * 60 * 1000)

		const record = await prisma.inPersonSafetyTalkRecord.create({
			data: {
				rut: normalizeRut(validatedData.rut),
				name: validatedData.name,
				company: validatedData.company,
				category: validatedData.category,
				sessionDate: validatedData.sessionDate,
				expiresAt,
				score: validatedData.score,
				notes: validatedData.notes,
				status: validatedData.status,
				source: "MANUAL",
				registeredById: session.user.id,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.CREATE,
			entityId: record.id,
			entityType: "InPersonSafetyTalkRecord",
			metadata: {
				rut: record.rut,
				name: record.name,
				company: record.company,
				category: record.category,
				sessionDate: record.sessionDate,
				score: record.score,
				status: record.status,
				source: "MANUAL",
			},
		})

		return {
			ok: true,
			message: "Registro de charla presencial creado correctamente",
			record,
		}
	} catch (error) {
		console.error("Error al registrar charla presencial:", error)

		if (error instanceof z.ZodError) {
			return {
				ok: false,
				message: "Datos inválidos",
				errors: error.issues,
			}
		}

		return {
			ok: false,
			message: "Error al crear el registro de charla presencial",
		}
	}
}
