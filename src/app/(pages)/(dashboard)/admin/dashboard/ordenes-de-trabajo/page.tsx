import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { LazyWorkOrderStatsContainer } from "@/project/work-order/components/stats/work-order/LazyWorkOrderStatsContainer"
import LazyCreateWorkOrderForm from "@/project/work-order/components/forms/LazyCreateWorkOrderForm"
import LazyNewWorkBookForm from "@/project/work-order/components/forms/LazyNewWorkBookForm"
import { WorkOrderTable } from "@/project/work-order/components/data/WorkOrderTable"
import ModuleHeader from "@/shared/components/ModuleHeader"

export default async function AdminUsersPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const [hasPermission, hassWorkBookPermission, hasDeleteEmptyPermission] = await Promise.all([
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
		auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: {
					workOrder: ["delete-empty"],
				},
			},
		}),
	])

	return (
		<div className={"flex h-full w-full flex-1 flex-col gap-8 transition-all"}>
			<ModuleHeader
				title="Órdenes de Trabajo"
				className="from-orange-600 to-red-600 dark:from-orange-800 dark:to-red-800"
				description="Gestión y seguimiento de órdenes de trabajo"
			>
				<>
					{hasPermission.success && <LazyCreateWorkOrderForm />}

					{hassWorkBookPermission.success && (
						<LazyNewWorkBookForm
							userId={session.user.id}
							companyId={process.env.NEXT_PUBLIC_INTERNAL_COMPANY_ID!}
							className="text-amber-600 hover:bg-white hover:text-amber-600 dark:text-amber-800 dark:hover:text-amber-800"
						/>
					)}
				</>
			</ModuleHeader>

			<div className="space-y-4">
				<LazyWorkOrderStatsContainer />
			</div>

			<WorkOrderTable id="work-order-table" canDelete={hasDeleteEmptyPermission.success} />
		</div>
	)
}
