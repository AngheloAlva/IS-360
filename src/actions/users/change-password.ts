"use server"

import { hashPassword } from "./hashPassword"
import prisma from "@/lib/prisma"

import type { Session } from "better-auth"

export async function changePassword(password: string, session: Session) {
	if (!session) throw new Error("No estás autenticado")

	const user = await prisma.user.findUnique({
		where: { id: session.userId },
		include: {
			accounts: true,
		},
	})

	if (!user) throw new Error("Usuario no encontrado")
	if (user.emailVerified) throw new Error("El email ya está verificado")

	const hashedPassword = await hashPassword(password)

	// Update password in account
	await prisma.account.update({
		where: { id: user.accounts[0].id },
		data: { password: hashedPassword },
	})

	// Mark email as verified
	await prisma.user.update({
		where: { id: user.id },
		data: { emailVerified: true },
	})

	return { success: true }
}
