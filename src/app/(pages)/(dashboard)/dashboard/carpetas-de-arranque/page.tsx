import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import StartupFolderOverview from "@/components/sections/startup-folders/StartupFolderOverview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
			<div>
				<h1 className="text-2xl font-bold">Carpetas de Arranque</h1>
				<p className="text-muted-foreground">
					Gestione la documentación necesaria para trabajar con nosotros
				</p>
			</div>

			<StartupFolderOverview userId={session.user.id} companyId={session.user.companyId} />
		</div>
	)
}
