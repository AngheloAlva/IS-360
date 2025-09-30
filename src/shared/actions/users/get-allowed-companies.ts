"use server"

import prisma from "@/lib/prisma"

export const getAllowedCompanyIds = async (userId: string): Promise<string[]> => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			allowedCompanies: true,
		},
	})

	if (!user) {
		return []
	}

	return user.allowedCompanies
}
