import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { USER_ROLE } from "@/lib/permissions"
import { auth } from "@/lib/auth"

import StartupFolderOverview from "@/components/sections/startup-folders/StartupFolderOverview"

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

	return (
		<div className="w-full flex-1 space-y-6">
			<StartupFolderOverview
				companyId={companyId}
				userId={session.user.id}
				isOtcMember={session.user.role === USER_ROLE.admin}
			/>
		</div>
	)
}
