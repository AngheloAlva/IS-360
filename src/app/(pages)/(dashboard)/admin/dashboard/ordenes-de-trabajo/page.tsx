import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { WorkOrderStatsContainer } from "@/project/work-order/components/stats/work-order/WorkOrderStatsContainer"
import CreateWorkOrderForm from "@/project/work-order/components/forms/CreateWorkOrderForm"
import { WorkOrderTable } from "@/project/work-order/components/data/WorkOrderTable"
import ScrollToTableButton from "@/shared/components/ScrollToTable"
import NewWorkBookForm from "@/project/work-order/components/forms/NewWorkBookForm"

export default async function AdminUsersPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const [hasPermission, hassWorkBookPermission] = await Promise.all([
		auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: {
					workOrder: ["create"],
				},
			},
		}),
		auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: {
					workBook: ["create"],
				},
			},
		}),
	])

	return (
		<div className={"flex h-full w-full flex-1 flex-col gap-8 transition-all"}>
			<div className="rounded-lg bg-gradient-to-r from-orange-600 to-red-600 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Órdenes de Trabajo</h1>
						<p className="opacity-90">Gestión y seguimiento de órdenes de trabajo</p>
					</div>

					<div className="flex flex-wrap items-center justify-end gap-2">
						<ScrollToTableButton
							id="work-order-table"
							label="Lista Órdenes"
							className="text-red-600 hover:bg-white hover:text-red-600"
						/>
						{hasPermission.success && <CreateWorkOrderForm />}
						{hassWorkBookPermission.success && (
							<NewWorkBookForm
								userId={session.user.id}
								companyId={process.env.NEXT_PUBLIC_OTC_COMPANY_ID!}
								className="text-amber-600 hover:bg-white hover:text-amber-600"
							/>
						)}
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<WorkOrderStatsContainer />
			</div>

			<WorkOrderTable id="work-order-table" />
		</div>
	)
}
