import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		const [companies, total, safetyTalks] = await Promise.all([
			prisma.company.findMany({
				where: {
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					name: true,
					rut: true,
					users: {
						select: {
							id: true,
							name: true,
							isSupervisor: true,
							safetyTalks: {
								select: {
									score: true,
									passed: true,
									completedAt: true,
									expiresAt: true,
									safetyTalk: {
										select: {
											id: true,
											title: true,
											minimumScore: true,
										},
									},
								},
							},
						},
					},
					createdAt: true,
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.company.count({
				where: {
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
			}),
			// Obtener todas las charlas de seguridad
			prisma.safetyTalk.findMany({
				select: {
					id: true,
					title: true,
					minimumScore: true,
					expiresAt: true,
					isPresential: true,
				},
			}),
		])

		// Procesar los datos para incluir las charlas pendientes
		const processedCompanies = companies.map(company => ({
			...company,
			users: company.users.map(user => ({
				...user,
				safetyTalks: safetyTalks.map(talk => {
					// Buscar si el usuario ya completó esta charla
					const userTalk = user.safetyTalks.find(ut => ut.safetyTalk.id === talk.id)
					
					return {
						...talk,
						completed: !!userTalk,
						score: userTalk?.score,
						passed: userTalk?.passed,
						completedAt: userTalk?.completedAt,
						expiresAt: userTalk?.expiresAt,
					}
				}),
			})),
		}))

		return NextResponse.json({
			companies: processedCompanies,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("Error fetching companies:", error)
		return NextResponse.json({ error: "Error fetching companies" }, { status: 500 })
	}
}
