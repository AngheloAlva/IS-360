"use server"

import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { AREAS } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user?.id) {
			return new NextResponse("No autorizado", { status: 401 })
		}

		const searchParams = request.nextUrl.searchParams
		const area = searchParams.get("area")
		const folderId = searchParams.get("folderId")

		if (!area) {
			return NextResponse.json({ error: "Area is required" }, { status: 400 })
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
		})

		return NextResponse.json({
			folders: folders.map((folder) => ({
				...folder,
				type: "folder",
				hasChildren: folder._count.subFolders > 0 || folder._count.files > 0,
			})),
			files: files.map((file) => ({ ...file, type: "file" })),
		})
	} catch (error) {
		console.error("Error fetching tree data:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
