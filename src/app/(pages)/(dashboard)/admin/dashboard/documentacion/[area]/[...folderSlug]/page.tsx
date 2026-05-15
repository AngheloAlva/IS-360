import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { Areas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import { FileExplorer } from "@/project/document/components/data/FileExplorer"

interface PageProps {
	params: Promise<{
		area: string
		folderSlug: string[]
	}>
}

export default async function DocumentsFilesPage({ params }: PageProps) {
	const { area, folderSlug: fullFolderSlugs } = await params

	const data = await auth.api.getSession({
		headers: await headers(),
	})

	if (!data?.user) {
		return notFound()
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: data.user.id,
			permissions: {
				documentation: ["update", "delete"],
			},
		},
	})

	const areaData = Areas[area as keyof typeof Areas]
	if (!areaData) {
		return notFound()
	}

	const lastSlug = fullFolderSlugs[fullFolderSlugs.length - 1]
	const [, folderId] = lastSlug.split("_")

	if (!folderId) {
		return notFound()
	}

	const areaName = areaData.title
	const areaValue = areaData.value

	const backPath =
		fullFolderSlugs.length >= 1
			? `/admin/dashboard/documentacion/${area}/${fullFolderSlugs.slice(0, -1).join("/")}`
			: `/admin/dashboard/documentacion/${area}`

	return (
		<div>
			<FileExplorer
				backPath={backPath}
				areaName={areaName}
				userId={data.user.id}
				areaValue={areaValue}
				actualFolderId={folderId}
				userRole={data.user.role}
				canUpdate={hasPermission.success}
				area={area as keyof typeof Areas}
				foldersSlugs={[area, ...fullFolderSlugs]}
				canCreate={data.user.documentAreas.includes(areaValue) || hasPermission.success}
			/>
		</div>
	)
}
