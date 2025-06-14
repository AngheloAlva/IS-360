import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { Areas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import { FileExplorer } from "@/features/document/components/data/FileExplorer"

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

	const folderId = fullFolderSlugs[fullFolderSlugs.length - 1].split("_")[1]

	const areaName = Areas[area as keyof typeof Areas]["title"]
	const areaValue = Areas[area as keyof typeof Areas]["value"]

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
