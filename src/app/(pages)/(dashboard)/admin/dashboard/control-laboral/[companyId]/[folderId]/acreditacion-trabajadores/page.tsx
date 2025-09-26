import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkersAccreditationFolderDocuments from "@/project/labor-control/components/data/WorkersAccreditationFolderDocuments"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"

export default async function StartupFolderReviewPage({
	params,
}: {
	params: Promise<{ companyId: string; folderId: string }>
}) {
	const asyncParams = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const companyId = asyncParams.companyId
	const companyName = asyncParams.companyId.split("_")[0].replaceAll("-", " ")
	const folderName = asyncParams.folderId.split("_")[0].replaceAll("-", " ")

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title={companyName + " - " + folderName + " - Acreditación trabajadores"}
				className="from-blue-600 to-sky-500"
				backHref={
					"/admin/dashboard/control-laboral/" + asyncParams.companyId + "/" + asyncParams.folderId
				}
				description={`Gestion de la carpeta "${folderName} > Acreditación trabajadores" de la empresa "${companyName}"`}
			/>

			<WorkersAccreditationFolderDocuments
				companyId={companyId}
				folderId={asyncParams.folderId}
				isOtcMember={session.user.accessRole === "ADMIN"}
			/>
		</div>
	)
}
