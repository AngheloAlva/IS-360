import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkOrderStartupOverview from "@/components/sections/startup-folders/work-order/WorkOrderStartupOverview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function WorkOrderStartupFolderPage({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})
	const folderId = (await params).id

	if (!session?.user?.id || !session?.user?.companyId) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Acceso denegado</AlertTitle>
				<AlertDescription>Debe iniciar sesión para acceder a esta página.</AlertDescription>
			</Alert>
		)
	}

	return (
		<WorkOrderStartupOverview
			folderId={folderId}
			companyId={session.user.companyId}
			userId={session.user.id}
		/>
	)
}
