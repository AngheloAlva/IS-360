import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { auth } from "@/lib/auth"
import { getFirstStartupFolder } from "@/project/startup-folder/actions/get-first-startup-folder"
import StartupFolderInstantRedirect from "@/project/startup-folder/components/navigation/StartupFolderInstantRedirect"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"

export default async function StartupFolderCompanyRoutePage({
	params,
}: {
	params: Promise<{ companyId: string }>
}) {
	const { companyId } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id || session.user.companyId !== companyId) {
		return notFound()
	}

	const firstFolder = await getFirstStartupFolder({
		companyId,
	})

	if (firstFolder) {
		return (
			<StartupFolderInstantRedirect
				targetPath={`/dashboard/carpetas-de-arranque/${companyId}/${firstFolder.id}`}
			/>
		)
	}

	return (
		<Alert>
			<AlertTitle>Sin carpetas de arranque</AlertTitle>
			<AlertDescription>No encontramos carpetas activas para esta empresa.</AlertDescription>
		</Alert>
	)
}
