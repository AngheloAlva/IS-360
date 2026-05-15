import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { auth } from "@/lib/auth"
import StartupFolderRouteView from "@/project/startup-folder/components/data/StartupFolderRouteView"

export default async function StartupFolderVehicleDocumentsRoutePage({
	params,
}: {
	params: Promise<{ companyId: string; startupFolderId: string; vehicleId: string }>
}) {
	const { companyId, startupFolderId, vehicleId } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id || session.user.companyId !== companyId) {
		return notFound()
	}

	return (
		<StartupFolderRouteView
			mode="vehicleDocuments"
			userId={session.user.id}
			vehicleId={vehicleId}
			companyId={companyId}
			startupFolderId={startupFolderId}
		/>
	)
}
