import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import StartupFolderOverview from "@/project/startup-folder/components/data/StartupFolderOverview"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"

export default async function StartupFoldersPage() {
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
			<StartupFolderOverview
				isOtcMember={false}
				hasPermission={false}
				userId={session.user.id}
				companyId={session.user.companyId}
			/>
		</div>
	)
}
