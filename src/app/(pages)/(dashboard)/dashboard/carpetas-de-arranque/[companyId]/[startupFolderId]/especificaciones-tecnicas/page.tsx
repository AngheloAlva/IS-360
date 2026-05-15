import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { auth } from "@/lib/auth"
import StartupFolderRouteView from "@/project/startup-folder/components/data/StartupFolderRouteView"

export default async function StartupFolderTechSpecsRoutePage({
	params,
}: {
	params: Promise<{ companyId: string; startupFolderId: string }>
}) {
	const { companyId, startupFolderId } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id || session.user.companyId !== companyId) {
		return notFound()
	}

	return (
		<StartupFolderRouteView
			mode="techSpecs"
			userId={session.user.id}
			companyId={companyId}
			startupFolderId={startupFolderId}
		/>
	)
}
