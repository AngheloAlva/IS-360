import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { WorkerLaborControlFolderDocuments } from "@/project/labor-control/components/data/WorkerLaborControlFolderDocuments"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"

export default async function WorkerLaborControlFolderPage({
	params,
}: {
	params: Promise<{ folderId: string; workerFolderId: string }>
}) {
	const asyncParams = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const folderId = asyncParams.folderId
	const workerFolderId = asyncParams.workerFolderId
	const folderName = asyncParams.folderId.split("_")[0].replaceAll("-", " ")
	const workerName = asyncParams.workerFolderId.split("_")[0].replaceAll("-", " ")

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title={folderName + " - " + workerName}
				className="from-blue-600 to-sky-500"
				backHref={"/dashboard/control-laboral/" + folderId + "/acreditacion-trabajadores"}
				description={`Gestion de la carpeta "${folderName} > Acreditación trabajadores > ${workerName}"`}
			/>

			<WorkerLaborControlFolderDocuments
				workerName={workerName}
				userId={session.user.id}
				folderId={workerFolderId}
				isOtcMember={session.user.accessRole === "ADMIN"}
			/>
		</div>
	)
}
