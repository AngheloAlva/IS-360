import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkBookMain from "@/project/work-order/components/data/WorkBookMain"

export default async function AdminWorkBooksPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				workOrder: ["create"],
			},
		},
	})

	return (
		<WorkBookMain
			workBookId={id}
			userId={session.user.id}
			userRole={session.user.role!}
			hasPermission={hasPermission.success}
		/>
	)
}
