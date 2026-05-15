import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { auth } from "@/lib/auth"
import StartupFolderRouteView from "@/project/startup-folder/components/data/StartupFolderRouteView"

export default async function AdminStartupFolderEnvironmentRoutePage({
	params,
}: {
	params: Promise<{ companyId: string; startupFolderId: string }>
}) {
	const { companyId: companyPathParam, startupFolderId } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				startupFolder: ["create"],
			},
		},
	})

	const companyId = companyPathParam.split("_")[1]
	if (!companyId) return notFound()

	return (
		<StartupFolderRouteView
			mode="environment"
			userId={session.user.id}
			companyId={companyId}
			companyPathParam={companyPathParam}
			startupFolderId={startupFolderId}
			routeBasePath="/admin/dashboard/carpetas-de-arranque"
			backHref="/admin/dashboard/carpetas-de-arranque"
			isInternalMember
			hasPermission={hasPermission.success}
		/>
	)
}
