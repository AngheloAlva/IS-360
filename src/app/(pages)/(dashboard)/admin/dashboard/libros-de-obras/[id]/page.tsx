import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { getWorkOrderById } from "@/actions/work-orders/getWorkOrders"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WORK_ORDER_STATUS } from "@prisma/client"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"

import { ApproveWorkBookClosure } from "@/components/sections/work-book/ApproveWorkBookClosure"
import WorkBookEntriesTable from "@/components/sections/work-book/WorkBookEntriesTable"
import WorkBookGeneralData from "@/components/sections/work-book/WorkBookGeneralData"
import OtcInspectorForm from "@/components/forms/work-book/OtcInspectorForm"
import ActivityForm from "@/components/forms/work-book/WorkBookActivityForm"
import BackButton from "@/components/shared/BackButton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default async function AdminWorkBooksPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})
	const { id } = await params

	const { data } = await getWorkOrderById(id)

	if (!data || !session?.user) {
		return notFound()
	}

	return (
		<div className="w-full flex-1 space-y-6 p-4">
			<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href="/admin/dashboard/libros-de-obras" />

					<div>
						<h1 className="text-2xl font-bold">{data.workName || "Libro de Obras no creado"}</h1>
						<p className="text-feature mt-1 text-base font-medium">{data.otNumber}</p>
					</div>
				</div>

				<div className="flex w-full flex-col items-end gap-2 md:w-64">
					<Badge
						className={cn("bg-primary/5 border-primary text-primary", {
							"border-yellow-500 bg-yellow-500/5 text-yellow-500":
								data.status === WORK_ORDER_STATUS.PENDING,
							"border-green-500 bg-green-500/5 text-green-500":
								data.status === WORK_ORDER_STATUS.COMPLETED,
							"border-red-500 bg-red-500/5 text-red-500":
								data.status === WORK_ORDER_STATUS.CANCELLED ||
								data.status === WORK_ORDER_STATUS.EXPIRED,
						})}
					>
						{WorkOrderStatusLabels[data.status as keyof typeof WorkOrderStatusLabels]}
					</Badge>

					<div className="flex items-center justify-between gap-4">
						<span className="text-sm font-medium">Progreso del trabajo:</span>
						<span className="text-sm font-bold">{data.workProgressStatus}%</span>
					</div>
					<Progress
						value={data.workProgressStatus || 0}
						className="h-2"
						indicatorClassName={
							data.workProgressStatus && data.workProgressStatus > 50
								? "bg-green-500"
								: "bg-yellow-500"
						}
					/>
				</div>
			</div>

			<WorkBookGeneralData data={data} />

			<div className="flex w-full items-center justify-between gap-2">
				<h2 className="text-text text-2xl font-bold">Lista de Actividades</h2>

				<div className="flex gap-2">
					<ActivityForm entryType="DAILY_ACTIVITY" workOrderId={id} userId={session.user?.id} />

					<ActivityForm
						entryType="ADDITIONAL_ACTIVITY"
						workOrderId={id}
						userId={session.user?.id}
					/>

					<OtcInspectorForm userId={session.user?.id} workOrderId={id} />
				</div>
			</div>

			{session?.user?.role === "ADMIN" &&
				session.user.id === data.responsibleId &&
				data.status === WORK_ORDER_STATUS.CLOSURE_REQUESTED && (
					<ApproveWorkBookClosure workOrderId={id} userId={session?.user?.id} />
				)}

			<WorkBookEntriesTable workOrderId={id} />
		</div>
	)
}
