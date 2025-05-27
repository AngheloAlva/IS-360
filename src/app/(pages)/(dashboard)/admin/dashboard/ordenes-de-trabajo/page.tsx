import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { WorkOrderDataTable } from "@/components/sections/work-order/WorkOrderDataTable"

export default async function AdminUsersPage(): Promise<React.ReactElement> {
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
		<div className={"flex h-full w-full flex-1 flex-col gap-8 transition-all"}>
			<WorkOrderDataTable hasPermission={hasPermission.success} />
		</div>
	)
}
