import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { Areas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import { FileExplorer } from "@/components/sections/documentation/FileExplorer"

import type { AREAS } from "@prisma/client"

interface PageProps {
	params: Promise<{
		area: string
	}>
}

export default async function AreaRootPage({ params }: PageProps) {
	const { area } = await params

	const data = await auth.api.getSession({ headers: await headers() })

	if (!data?.user) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: data.user.id,
			permissions: {
				documentation: ["update", "delete"],
			},
		},
	})

	const areaData = Areas[area as keyof typeof Areas]
	if (!areaData) return notFound()

	const areaKey = area as keyof typeof Areas
	const areaName = areaData.title
	const areaValue = areaData.value

	return (
		<div>
			<FileExplorer
				area={areaKey}
				areaName={areaName}
				userId={data.user.id}
				areaValue={areaValue}
				foldersSlugs={[area]}
				userRole={data.user.role}
				canUpdate={hasPermission.success}
				userDocumentAreas={data.user.documentAreas as AREAS[]}
				canCreate={data.user.documentAreas.includes(areaValue) || hasPermission.success}
			/>
		</div>
	)
}
