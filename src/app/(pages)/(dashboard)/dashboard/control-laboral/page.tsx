import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import LaborControlFoldersTable from "@/project/labor-control/components/data/LaborControlFoldersTable"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import MemoizedModuleHeader from "@/shared/components/ModuleHeader"

export default async function LaborControlFoldersPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id || !session?.user?.companyId) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Acceso denegado</AlertTitle>
				<AlertDescription>Debe iniciar sesión para acceder a esta página.</AlertDescription>
			</Alert>
		)
	}

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				title="Carpetas de Control Laboral"
				backHref={"/dashboard/control-laboral"}
				className="from-blue-600 to-sky-500"
				description="Gestion y seguimiento de todas las carpetas de control laboral de la empresa"
			/>

			<LaborControlFoldersTable companyId={session.user.companyId} />
		</div>
	)
}
