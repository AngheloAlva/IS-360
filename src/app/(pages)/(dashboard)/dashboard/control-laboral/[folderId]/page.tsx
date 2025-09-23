import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import MemoizedModuleHeader from "@/shared/components/ModuleHeader"
import LaborControlFolderDocuments from "@/project/labor-control/components/data/LaborControlFolderDocuments"

export default async function StartupFolderReviewPage({
	params,
}: {
	params: Promise<{ folderId: string }>
}) {
	const asyncParams = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id || !session?.user?.companyId) return notFound()

	const folderId = asyncParams.folderId

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title={"Carpetas de Control Laboral"}
				className="from-blue-600 to-sky-500"
				backHref={"/admin/dashboard/control-laboral"}
				description="Gestion y seguimiento de todas las carpetas de control laboral de la empresa"
			/>

			<LaborControlFolderDocuments
				folderId={folderId}
				folderStatus="DRAFT"
				userId={session.user.id}
				companyId={session.user.companyId}
				isOtcMember={session.user.accessRole === "ADMIN"}
			/>
		</div>
	)
}
