import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import LaborControlFoldersTable from "@/project/labor-control/components/data/LaborControlFoldersTable"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"

export default async function StartupFolderReviewPage({
	params,
}: {
	params: Promise<{ companyId: string }>
}) {
	const asyncParams = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const companyId = asyncParams.companyId.split("_")[1]
	const companyName = asyncParams.companyId.split("_")[0].replaceAll("-", " ")

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				className="from-blue-600 to-sky-500"
				backHref={"/admin/dashboard/control-laboral"}
				title={companyName || "Carpetas de Control Laboral"}
				description="Gestion y seguimiento de todas las carpetas de control laboral de la empresa"
			/>

			<LaborControlFoldersTable
				companyId={companyId}
				isOtcMember={session.user.accessRole === "ADMIN"}
			/>
		</div>
	)
}
