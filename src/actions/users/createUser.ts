"use server"

import { v4 as uuidv4 } from "uuid"

import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { sendNewUserEmail } from "@/actions/emails/sendRequestEmail"
import { hashPassword } from "@/actions/users/hashPassword"
import prisma from "@/lib/prisma"

import type { InternalUserSchema } from "@/lib/form-schemas/admin/user/internalUser.schema"

interface CreateUserProps {
	values: InternalUserSchema
}

export const createInternalUser = async ({ values }: CreateUserProps) => {
	try {
		const userId = uuidv4()

		const newUser = await prisma.user.create({
			data: {
				...values,
				id: userId,
				emailVerified: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		})

		const temporalPassword = generateTemporalPassword()
		const hashedPassword = await hashPassword(temporalPassword)

		const id = uuidv4()
		const accountId = uuidv4()

		await prisma.account.create({
			data: {
				id,
				user: {
					connect: {
						id: newUser.id,
					},
				},
				accountId: accountId,
				createdAt: new Date(),
				updatedAt: new Date(),
				providerId: "credential",
				password: hashedPassword,
			},
		})

		sendNewUserEmail({
			name: newUser.name,
			email: newUser.email,
			password: temporalPassword,
		})

		return { ok: true, message: "Usuario creado exitosamente", newUser }
	} catch (error) {
		console.error(error)
		return { ok: false, message: "Error al crear el usuario", error }
	}
}
