import { revalidatePath } from "next/cache"

import prisma from "@/lib/prisma"

export async function getSafetyTalks() {
	return prisma.safetyTalk.findMany({
		include: {
			resources: true,
			questions: {
				include: {
					options: true,
				},
			},
		},
		cacheStrategy: {
			ttl: 60,
			swr: 10,
		},
	})
}

export async function getSafetyTalkBySlug(slug: string) {
	return prisma.safetyTalk.findUnique({
		where: { slug },
		include: {
			resources: true,
			questions: {
				include: {
					options: true,
				},
			},
		},
		cacheStrategy: {
			ttl: 60,
			swr: 10,
		},
	})
}

export async function deleteSafetyTalk(id: string) {
	await prisma.safetyTalk.delete({
		where: { id },
	})

	revalidatePath("/dashboard/charlas-de-seguridad")
}
