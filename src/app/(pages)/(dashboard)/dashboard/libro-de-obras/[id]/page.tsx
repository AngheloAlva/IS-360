import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { getWorkOrderById } from "@/actions/work-orders/getWorkOrders"
import { USER_ROLE, WORK_ORDER_STATUS } from "@prisma/client"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"

import { RequestWorkBookClosure } from "@/components/sections/work-book/RequestWorkBookClosure"
import WorkBookEntriesTable from "@/components/sections/work-book/WorkBookEntriesTable"
import WorkBookGeneralData from "@/components/sections/work-book/WorkBookGeneralData"
import WorkBookMilestones from "@/components/sections/work-book/WorkBookMilestones"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ActivityForm from "@/components/forms/work-book/WorkBookActivityForm"
import BackButton from "@/components/shared/BackButton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default async function WorkBooksPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	const { id } = await params

	const { data } = await getWorkOrderById(id)

	if (!data || !session?.user) {
		return notFound()
	}

	const canAddActivities =
		data.status === WORK_ORDER_STATUS.IN_PROGRESS || data.status === WORK_ORDER_STATUS.PLANNED
	const canClose = session.user.role === USER_ROLE.SUPERVISOR && data.workProgressStatus === 100

	return (
		<>
			<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-3">
						<BackButton href="/admin/dashboard/libros-de-obras" />

						<div>
							<h1 className="text-2xl font-bold">{data.workName}</h1>
							<p className="text-feature mt-1 text-base font-medium">{data.otNumber}</p>
						</div>
					</div>

					<div className="flex w-full flex-col items-end gap-2 md:w-64">
						<Badge
							className={cn("border-slate-500 bg-slate-500/10 text-slate-500", {
								"border-purple-500 bg-purple-500/10 text-purple-500":
									data.status === WORK_ORDER_STATUS.IN_PROGRESS,
								"border-cyan-500 bg-cyan-500/10 text-cyan-500":
									data.status === WORK_ORDER_STATUS.CLOSURE_REQUESTED,
								"border-yellow-500 bg-yellow-500/10 text-yellow-500":
									data.status === WORK_ORDER_STATUS.PENDING,
								"border-green-500 bg-green-500/10 text-green-500":
									data.status === WORK_ORDER_STATUS.COMPLETED,
								"border-red-500 bg-red-500/10 text-red-500":
									data.status === WORK_ORDER_STATUS.CANCELLED,
							})}
						>
							{WorkOrderStatusLabels[data.status as keyof typeof WorkOrderStatusLabels]}
						</Badge>

						<div className="flex items-center justify-between gap-4">
							<span className="text-sm font-medium">Progreso del trabajo:</span>
							<span className="text-sm font-bold">{data.workProgressStatus?.toFixed(0)}%</span>
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
			</div>

			<WorkBookGeneralData data={data} />

			<Tabs defaultValue="milestones" className="w-full">
				{data._count.milestones > 0 && (
					<TabsList className="mb-6 h-11 w-full">
						<TabsTrigger value="milestones" className="h-9">
							Hitos y Tareas
						</TabsTrigger>
						<TabsTrigger value="activities" className="h-9">
							Actividades Diarias
						</TabsTrigger>
					</TabsList>
				)}

				<TabsContent value="milestones">
					<WorkBookMilestones workOrderId={id} userRole={session.user.role as USER_ROLE} />
				</TabsContent>

				<TabsContent value="activities">
					<div className="flex w-full items-center justify-between gap-2">
						<h2 className="text-text text-2xl font-bold">Lista de Actividades</h2>

						<div className="flex gap-2">
							{canAddActivities && (
								<>
									{canClose ? (
										<RequestWorkBookClosure workOrderId={id} userId={session?.user?.id} />
									) : (
										<>
											<ActivityForm
												workOrderId={id}
												userId={session.user?.id}
												entryType="DAILY_ACTIVITY"
												startDate={data.milestones[0]?.startDate || new Date()}
											/>
										</>
									)}
								</>
							)}
						</div>
					</div>

					<WorkBookEntriesTable workOrderId={id} />
				</TabsContent>
			</Tabs>
		</>
	)
}
