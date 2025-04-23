"use server"

import prisma from "@/lib/prisma"
import { AREAS } from "@prisma/client"
import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const area = searchParams.get("area")
		const folderId = searchParams.get("folderId")

		if (!area) {
			return Response.json({ error: "Area is required" }, { status: 400 })
		}

		const folders = await prisma.folder.findMany({
			where: {
				area: area as AREAS,
				parentId: folderId || null,
				isActive: true,
			},
			select: {
				id: true,
				name: true,
				slug: true,
				_count: {
					select: {
						files: {
							where: {
								isActive: true,
							},
						},
						subFolders: {
							where: {
								isActive: true,
							},
						},
					},
				},
			},
			orderBy: {
				name: "asc",
			},
			cacheStrategy: {
				ttl: 60,
				swr: 10,
			},
		})

		const files = await prisma.file.findMany({
			where: {
				folderId: folderId || null,
				area: area as AREAS,
				isActive: true,
			},
			select: {
				id: true,
				url: true,
				name: true,
				code: true,
			},
			orderBy: {
				name: "asc",
			},
			cacheStrategy: {
				ttl: 60,
				swr: 10,
			},
		})

		return Response.json({
			folders: folders.map((folder) => ({
				...folder,
				type: "folder",
				hasChildren: folder._count.subFolders > 0 || folder._count.files > 0,
			})),
			files: files.map((file) => ({ ...file, type: "file" })),
		})
	} catch (error) {
		console.error("Error fetching tree data:", error)
		return Response.json({ error: "Internal server error" }, { status: 500 })
	}
}
