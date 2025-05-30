import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { Areas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import { NewFileFormSheet } from "@/components/forms/document-management/NewFileFormSheet"
import NewFolderFormSheet from "@/components/forms/document-management/NewFolderFormSheet"
import { FileExplorer } from "@/components/sections/documentation/FileExplorer"
import BackButton from "@/components/shared/BackButton"

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
			? `/dashboard/documentacion/${area}/${fullFolderSlugs.slice(0, -1).join("/")}`
			: `/dashboard/documentacion/${area}`

	return (
		<div>
			<div className="mb-8 flex gap-4 md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href={backPath} />

					<h1 className="text-text text-3xl font-bold">{areaName}</h1>
				</div>

				{(data.user.documentAreas.includes(areaValue) || hasPermission.success) && (
					<div className="ml-auto flex gap-2">
						<NewFileFormSheet
							areaValue={areaValue}
							userId={data.user.id}
							parentFolderId={folderId}
							area={area as keyof typeof Areas}
						/>

						<NewFolderFormSheet
							area={area as keyof typeof Areas}
							userId={data.user.id}
							parentFolderId={folderId}
						/>
					</div>
				)}
			</div>

			<FileExplorer
				userId={data.user.id}
				areaValue={areaValue}
				actualFolderId={folderId}
				userRole={data.user.role}
				canUpdate={hasPermission.success}
				foldersSlugs={[area, ...fullFolderSlugs]}
			/>
		</div>
	)
}
