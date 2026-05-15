import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { getAllowedCompanyIds } from "@/shared/actions/users/get-allowed-companies"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 })
		}

		const userAllowedCompanies = await getAllowedCompanyIds(session.user.id)

		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		// Obtener charlas de usuarios internos
		const [internalSafetyTalks, internalTotal] = await Promise.all([
			prisma.userSafetyTalk.findMany({
				where: {
					...(userAllowedCompanies?.length
						? {
								user: {
									companyId: {
										in: userAllowedCompanies,
									},
								},
							}
						: {}),
					...(search
						? {
								OR: [
									{ user: { name: { contains: search, mode: "insensitive" as const } } },
									{ user: { email: { contains: search, mode: "insensitive" as const } } },
									{ user: { rut: { contains: search, mode: "insensitive" as const } } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					category: true,
					status: true,
					score: true,
					completedAt: true,
					expiresAt: true,
					currentAttempts: true,
					lastAttemptAt: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							rut: true,
							company: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
				orderBy: {
					completedAt: "desc",
				},
			}),
			prisma.userSafetyTalk.count({
				where: {
					...(userAllowedCompanies?.length
						? {
								user: {
									companyId: {
										in: userAllowedCompanies,
									},
								},
							}
						: {}),
					...(search
						? {
								OR: [
									{ user: { name: { contains: search, mode: "insensitive" as const } } },
									{ user: { email: { contains: search, mode: "insensitive" as const } } },
									{ user: { rut: { contains: search, mode: "insensitive" as const } } },
								],
							}
						: {}),
				},
			}),
		])

		// Obtener charlas de usuarios externos (VisitorTalkCompletion)
		const [externalSafetyTalks, externalTotal] = await Promise.all([
			prisma.visitorTalkCompletion.findMany({
				where: {
					status: "COMPLETED",
					passed: true,
					...(search
						? {
								OR: [
									{ visitor: { name: { contains: search, mode: "insensitive" as const } } },
									{ visitor: { email: { contains: search, mode: "insensitive" as const } } },
									{ visitor: { rut: { contains: search, mode: "insensitive" as const } } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					score: true,
					completedAt: true,
					attemptNumber: true,
					visitorTalk: {
						select: {
							category: true,
						},
					},
					visitor: {
						select: {
							id: true,
							name: true,
							email: true,
							rut: true,
							company: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
				orderBy: {
					completedAt: "desc",
				},
			}),
			prisma.visitorTalkCompletion.count({
				where: {
					status: "COMPLETED",
					passed: true,
					...(search
						? {
								OR: [
									{ visitor: { name: { contains: search, mode: "insensitive" as const } } },
									{ visitor: { email: { contains: search, mode: "insensitive" as const } } },
									{ visitor: { rut: { contains: search, mode: "insensitive" as const } } },
								],
							}
						: {}),
				},
			}),
		])

		// Transformar datos externos al formato ApiSafetyTalk
		const transformedExternalTalks = externalSafetyTalks.map((talk) => ({
			id: talk.id,
			category: talk.visitorTalk.category,
			status: "PASSED", // Los externos que completaron exitosamente
			score: talk.score,
			completedAt: talk.completedAt?.toISOString() ?? null,
			expiresAt: talk.completedAt
				? new Date(
						new Date(talk.completedAt).setFullYear(new Date(talk.completedAt).getFullYear() + 1)
					).toISOString()
				: null,
			currentAttempts: talk.attemptNumber,
			lastAttemptAt: talk.completedAt?.toISOString() ?? null,
			isExternal: true,
			externalVisitor: talk.visitor,
		}))

		// Combinar y ordenar ambos tipos de charlas
		const allSafetyTalks = [
			...internalSafetyTalks.map((talk) => ({
				...talk,
				completedAt: talk.completedAt?.toISOString() ?? null,
				expiresAt: talk.expiresAt?.toISOString() ?? null,
				lastAttemptAt: talk.lastAttemptAt?.toISOString() ?? null,
				isExternal: false,
			})),
			...transformedExternalTalks,
		].sort((a, b) => {
			const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0
			const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0
			return dateB - dateA
		})

		const total = internalTotal + externalTotal

		// Aplicar paginación después de combinar
		const paginatedData = allSafetyTalks.slice(skip, skip + limit)

		return NextResponse.json({
			data: paginatedData,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[SAFETY_TALKS_TABLE]", error)
		return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
	}
}
