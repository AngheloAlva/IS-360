import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { auth } from "@/lib/auth"
import StartupFolderRouteView from "@/project/startup-folder/components/data/StartupFolderRouteView"

export default async function StartupFolderWorkerDocumentsRoutePage({
	params,
}: {
	params: Promise<{ companyId: string; startupFolderId: string; workerId: string }>
}) {
	const { companyId, startupFolderId, workerId } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id || session.user.companyId !== companyId) {
		return notFound()
	}

	return (
		<StartupFolderRouteView
			mode="workerDocuments"
			userId={session.user.id}
			workerId={workerId}
			companyId={companyId}
			startupFolderId={startupFolderId}
		/>
	)
}
