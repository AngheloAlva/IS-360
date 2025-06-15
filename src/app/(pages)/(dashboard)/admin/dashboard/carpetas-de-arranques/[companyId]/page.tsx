import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import StartupFolderOverview from "@/project/startup-folder/components/data/StartupFolderOverview"

export default async function StartupFolderReviewPage({
	params,
}: {
	params: Promise<{ companyId: string }>
}) {
	const { companyId } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				startupFolder: ["create"],
			},
		},
	})

	return (
		<div className="w-full flex-1 space-y-6">
			<StartupFolderOverview
				companyId={companyId}
				userId={session.user.id}
				hasPermission={hasPermission.success}
				isOtcMember={session.user.accessRole === "ADMIN"}
			/>
		</div>
	)
}
