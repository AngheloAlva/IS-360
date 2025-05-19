import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const search = searchParams.get("search") || ""

		const startupFolder = await prisma.startupFolder.findMany({
			where: {
				...(search
					? {
							OR: [
								{ company: { name: { contains: search, mode: "insensitive" as const } } },
								{ company: { rut: { contains: search, mode: "insensitive" as const } } },
							],
						}
					: {}),
			},
			include: {
				company: {
					select: {
						id: true,
						name: true,
						rut: true,
						image: true,
					},
				},
				safetyAndHealthFolders: {
					include: {
						documents: {
							orderBy: {
								name: "asc",
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
				environmentalFolders: {
					include: {
						documents: {
							orderBy: {
								name: "asc",
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
				workersFolders: {
					include: {
						documents: {
							orderBy: {
								name: "asc",
							},
						},
						worker: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
					orderBy: {
						worker: {
							name: "asc",
						},
					},
				},
				vehiclesFolders: {
					include: {
						documents: {
							orderBy: {
								name: "asc",
							},
						},
						vehicle: true,
					},
				},
			},
		})

		// Si no existe la carpeta, devolvemos error
		if (!startupFolder) {
			return new NextResponse("General startup folder not found", { status: 404 })
		}

		return NextResponse.json(startupFolder)
	} catch (error) {
		console.error("[GENERAL_STARTUP_FOLDER_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
