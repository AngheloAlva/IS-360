import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

import type { AREAS } from "@prisma/client"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const area = searchParams.get("area") as AREAS
		const folderSlug = searchParams.get("folderSlug") || null

		const [files, folders] = await Promise.all([
			prisma.file.findMany({
				where: {
					folder: folderSlug ? { slug: folderSlug } : null,
				},
				include: {
					user: {
						select: {
							name: true,
						},
					},
				},
			}),
			prisma.folder.findMany({
				where: { area, parent: folderSlug ? { slug: folderSlug } : null },
				include: {
					user: {
						select: {
							name: true,
						},
					},
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
