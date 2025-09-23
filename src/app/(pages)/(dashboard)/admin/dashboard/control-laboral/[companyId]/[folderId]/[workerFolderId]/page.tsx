import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { WorkerLaborControlFolderDocuments } from "@/project/labor-control/components/data/WorkerLaborControlFolderDocuments"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"

export default async function WorkerLaborControlFolderPage({
	params,
}: {
	params: Promise<{ companyId: string; folderId: string; workerFolderId: string }>
}) {
	const asyncParams = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	// const companyId = asyncParams.companyId
	// const folderId = asyncParams.folderId
	const workerFolderId = asyncParams.workerFolderId
	// const companyName = asyncParams.companyId.split("_")[0].replaceAll("-", " ")

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title={"Carpetas de Control Laboral"}
				className="from-blue-600 to-sky-500"
				backHref={"/admin/dashboard/control-laboral"}
				description="Gestion y seguimiento de todas las carpetas de control laboral de la empresa"
			/>

			<WorkerLaborControlFolderDocuments
				workerName=""
				userId={session.user.id}
				folderId={workerFolderId}
				isOtcMember={session.user.accessRole === "ADMIN"}
			/>
		</div>
	)
}
