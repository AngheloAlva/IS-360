import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { WorkOrderStatsContainer } from "@/project/work-order/components/stats/work-order/WorkOrderStatsContainer"
import CreateWorkOrderForm from "@/project/work-order/components/forms/CreateWorkOrderForm"
import { WorkOrderTable } from "@/project/work-order/components/data/WorkOrderTable"

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
			<div className="rounded-lg bg-gradient-to-r from-orange-600 to-red-600 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Órdenes de Trabajo</h1>
						<p className="opacity-90">Gestión y seguimiento de órdenes de trabajo</p>
					</div>

					{hasPermission.success && <CreateWorkOrderForm />}
				</div>
			</div>

			<div className="space-y-4">
				<WorkOrderStatsContainer />
			</div>

			<WorkOrderTable />
		</div>
	)
}
