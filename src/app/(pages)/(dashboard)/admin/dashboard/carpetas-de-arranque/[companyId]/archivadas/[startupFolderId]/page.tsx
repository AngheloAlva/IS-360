import { notFound } from "next/navigation"
import { headers } from "next/headers"

import StartupFolderRouteView from "@/project/startup-folder/components/data/StartupFolderRouteView"
import { auth } from "@/lib/auth"

export default async function AdminArchivedStartupFolderOverviewPage({
	params,
}: {
	params: Promise<{ companyId: string; startupFolderId: string }>
}) {
	const { companyId: companyPathParam, startupFolderId } = await params

	const session = await auth.api.getSession({ headers: await headers() })
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
			isInternalMember
			mode="overview"
			companyId={companyId}
			userId={session.user.id}
			startupFolderId={startupFolderId}
			companyPathParam={companyPathParam}
			hasPermission={hasPermission.success}
			backHref="/admin/dashboard/carpetas-de-arranque"
			routeBasePath="/admin/dashboard/carpetas-de-arranque"
			folderPathPrefix="archivadas"
			isArchivedView
		/>
	)
}
