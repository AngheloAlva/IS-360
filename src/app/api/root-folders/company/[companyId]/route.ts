import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
) {
	try {
		const companyId = (await params).companyId

		const searchParams = req.nextUrl.searchParams
		const parentFolderSlug = searchParams.get("parentFolderSlug")

		const [rootFolders, files] = await Promise.all([
			prisma.rootFolder.findMany({
				where: {
					companyId,
					isActive: true,
					...(parentFolderSlug ? { slug: parentFolderSlug } : {}),
				},
				include: {
					_count: {
						select: {
							files: true,
						},
					},
				},
			}),
			parentFolderSlug
				? prisma.file.findMany({
						where: {
							rootFolder: {
								slug: parentFolderSlug,
							},
							isActive: true,
						},
						select: {
							id: true,
							url: true,
							size: true,
							type: true,
							name: true,
						},
					})
				: null,
		])

		return NextResponse.json({ rootFolders, files })
	} catch (error) {
		console.error("[USERS_GET]", error)
		return NextResponse.json({ error: "Error fetching users" }, { status: 500 })
	}
}
