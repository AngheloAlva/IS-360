import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { getFirstStartupFolder } from "@/project/startup-folder/actions/get-first-startup-folder"
import StartupFolderInstantRedirect from "@/project/startup-folder/components/navigation/StartupFolderInstantRedirect"

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

	const firstFolder = await getFirstStartupFolder({
		companyId: session.user.companyId,
	})

	if (firstFolder) {
		return (
			<StartupFolderInstantRedirect
				targetPath={`/dashboard/carpetas-de-arranque/${session.user.companyId}/${firstFolder.id}`}
			/>
		)
	}

	return (
		<Alert>
			<AlertTitle>Sin carpetas de arranque</AlertTitle>
			<AlertDescription>
				Tu empresa aun no tiene carpetas disponibles para gestionar.
			</AlertDescription>
		</Alert>
	)
}
