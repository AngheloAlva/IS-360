import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

import type { AREAS } from "@prisma/client"

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const area = searchParams.get("area") as AREAS
		const folderId = searchParams.get("folderId") || null
		const order = searchParams.get("order") as "asc" | "desc"
		const orderBy = searchParams.get("orderBy") as "name" | "createdAt"

		const [files, folders] = await Promise.all([
			prisma.file.findMany({
				where: {
					OR: [
						{
							folder: folderId ? { id: folderId } : null,
							area,
						},
					],
					isActive: true,
				},
				include: {
					user: {
						select: {
							name: true,
						},
					},
					comments: {
						include: {
							user: {
								select: {
									name: true,
								},
							},
						},
					},
				},
				orderBy: {
					[orderBy]: order,
				},
			}),
			prisma.folder.findMany({
				where: {
					area,
					parent: folderId ? { id: folderId } : null,
					isActive: true,
					isExternal: false,
				},
				include: {
					user: {
						select: {
							name: true,
						},
					},
					_count: {
						select: {
							files: {
								where: { isActive: true },
							},
							subFolders: {
								where: { isActive: true },
							},
						},
					},
				},
				orderBy: {
					[orderBy]: order,
				},
			}),
		])

		return NextResponse.json({
			files,
			folders,
		})
	} catch (error) {
		console.error("[FILES_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
