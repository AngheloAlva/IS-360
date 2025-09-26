import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkersAccreditationFolderDocuments from "@/project/labor-control/components/data/WorkersAccreditationFolderDocuments"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"

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

	const folderName = asyncParams.folderId.split("_")[0].replaceAll("-", " ")

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title={folderName + " - Acreditación trabajadores"}
				className="from-blue-600 to-sky-500"
				backHref={"/dashboard/control-laboral/" + asyncParams.folderId}
				description={`Gestion de la carpeta "${folderName} > Acreditación trabajadores"`}
			/>

			<WorkersAccreditationFolderDocuments
				folderId={asyncParams.folderId}
				companyId={session.user.companyId}
				isOtcMember={session.user.accessRole === "ADMIN"}
			/>
		</div>
	)
}
