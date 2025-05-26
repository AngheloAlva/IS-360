import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { Areas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import NewFolderFormSheet from "@/components/forms/document-management/NewFolderFormSheet"
import { NewFileFormSheet } from "@/components/forms/document-management/NewFileFormSheet"
import { FileExplorer } from "@/components/sections/documentation/FileExplorer"
import BackButton from "@/components/shared/BackButton"

interface PageProps {
	params: Promise<{
		area: string
	}>
}

export default async function AreaRootPage({ params }: PageProps) {
	const { area } = await params
	const data = await auth.api.getSession({ headers: await headers() })

	if (!data?.user) return notFound()

	const areaData = Areas[area as keyof typeof Areas]
	if (!areaData) return notFound()

	const areaKey = area as keyof typeof Areas
	const areaName = areaData.title
	const areaValue = areaData.value

	return (
		<div>
			<div className="mb-8 flex gap-4 md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href="/dashboard/documentacion" />

					<h1 className="text-text text-3xl font-bold">{areaName}</h1>
				</div>

				<div className="ml-auto flex gap-2">
					<NewFileFormSheet areaValue={areaValue} area={areaKey} userId={data.user.id} />

					<NewFolderFormSheet area={areaKey} userId={data.user.id} />
				</div>
			</div>

			<FileExplorer
				userId={data.user.id}
				areaValue={areaValue}
				foldersSlugs={[area]}
				userRole={data.user.role}
			/>
		</div>
	)
}
