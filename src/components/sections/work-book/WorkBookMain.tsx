"use client"

import { subDays } from "date-fns"

import { useWorkBookById } from "@/hooks/work-orders/use-work-book-by-id"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WORK_ORDER_STATUS } from "@prisma/client"
import { cn } from "@/lib/utils"

import { ApproveWorkBookClosure } from "@/components/sections/work-book/ApproveWorkBookClosure"
import WorkBookEntriesTable from "@/components/sections/work-book/WorkBookEntriesTable"
import WorkBookGeneralData from "@/components/sections/work-book/WorkBookGeneralData"
import WorkBookMilestones from "@/components/sections/work-book/WorkBookMilestones"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OtcInspectorForm from "@/components/forms/work-book/OtcInspectorForm"
import ActivityForm from "@/components/forms/work-book/WorkBookActivityForm"
import BackButton from "@/components/shared/BackButton"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface WorkBookMainProps {
	userId: string
	userRole: string
	workBookId: string
	hasPermission: boolean
}

export default function WorkBookMain({
	userId,
	userRole,
	workBookId,
	hasPermission,
}: WorkBookMainProps): React.ReactElement {
	const { data, isLoading, isError, isFetching } = useWorkBookById({ workOrderId: workBookId })

	if (isLoading || isFetching) {
		return (
			<div className="w-full space-y-4">
				<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-3">
						<BackButton href="/dashboard/libros-de-obras" />

						<div>
							<h1 className="text-2xl font-bold">
								<Skeleton className="h-6 w-40 rounded" />
							</h1>
							<div className="mt-1 text-base font-medium">
								<Skeleton className="h-4 w-24 rounded" />
							</div>
						</div>
					</div>

					<div className="flex w-full flex-col items-end gap-2 md:w-64">
						<Skeleton className="h-6 w-24 rounded" />

						<div className="flex items-center justify-between gap-4">
							<Skeleton className="h-6 w-24 rounded" />
							<Skeleton className="h-6 w-24 rounded" />
						</div>
						<Progress value={0} className="h-2" />
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<Skeleton className="h-140 w-full rounded-lg md:h-96" />
					<Skeleton className="h-140 w-full rounded-lg" />
				</div>
			</div>
		)
	}

	console.log("WORKBOOK", data?.workBook)

	if (isError || !data?.workBook) {
		return (
			<div className="w-full rounded-md border border-amber-200 bg-amber-50 p-4">
				<h2 className="text-lg font-semibold text-amber-800">Error al cargar el libro de obras</h2>
				<p className="text-sm text-amber-700">
					No se pudo cargar el libro de obras. Por favor, intente nuevamente.
				</p>
			</div>
		)
	}

	const workBook = data?.workBook

	const canAddActivities =
		workBook.status === WORK_ORDER_STATUS.IN_PROGRESS ||
		workBook.status === WORK_ORDER_STATUS.PLANNED
	const canClose = workBook.workProgressStatus === 100 && workBook.supervisorId === userId

	return (
		<>
			<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton
						href={
							userRole === "partnerCompany"
								? "/dashboard/libro-de-obras"
								: "/admin/dashboard/libros-de-obras"
						}
					/>

					<div>
						<h1 className="text-2xl font-bold">
							{workBook.workName || "Libro de Obras no creado"}
						</h1>
						<p className="text-feature mt-1 text-base font-medium">{workBook.otNumber}</p>
					</div>
				</div>

				<div className="flex w-full flex-col items-end gap-2 md:w-64">
					<Badge
						className={cn("border-slate-500 bg-slate-500/10 text-slate-500", {
							"border-purple-500 bg-purple-500/10 text-purple-500":
								workBook.status === WORK_ORDER_STATUS.IN_PROGRESS,
							"border-cyan-500 bg-cyan-500/10 text-cyan-500":
								workBook.status === WORK_ORDER_STATUS.CLOSURE_REQUESTED,
							"border-yellow-500 bg-yellow-500/10 text-yellow-500":
								workBook.status === WORK_ORDER_STATUS.PENDING,
							"border-green-500 bg-green-500/10 text-green-500":
								workBook.status === WORK_ORDER_STATUS.COMPLETED,
							"border-red-500 bg-red-500/10 text-red-500":
								workBook.status === WORK_ORDER_STATUS.CANCELLED,
						})}
					>
						{WorkOrderStatusLabels[workBook.status as keyof typeof WorkOrderStatusLabels]}
					</Badge>

					<div className="flex items-center justify-between gap-4">
						<span className="text-sm font-medium">Progreso del trabajo:</span>
						<span className="text-sm font-bold">{workBook.workProgressStatus}%</span>
					</div>
					<Progress
						value={workBook.workProgressStatus || 0}
						className="h-2"
						indicatorClassName={
							workBook.workProgressStatus && workBook.workProgressStatus > 50
								? "bg-green-500"
								: "bg-yellow-500"
						}
					/>
				</div>
			</div>

			<WorkBookGeneralData canClose={canClose} userId={userId} data={workBook} />

			<Tabs defaultValue="milestones" className="w-full">
				<TabsList className="mb-6 h-11 w-full">
					<TabsTrigger value="milestones" className="h-9">
						Hitos y Tareas
					</TabsTrigger>
					<TabsTrigger value="activities" className="h-9">
						Actividades Diarias
					</TabsTrigger>
				</TabsList>

				<TabsContent value="milestones">
					<WorkBookMilestones
						userId={userId}
						userRole={userRole}
						workOrderId={workBook.id}
						workOrderStartDate={subDays(workBook.workStartDate || new Date(), 1)}
					/>
				</TabsContent>

				<TabsContent value="activities">
					<div className="flex w-full items-center justify-between gap-2">
						<h2 className="text-text mb-2 text-2xl font-bold">Lista de Actividades</h2>

						<div className="flex gap-2">
							{canAddActivities && (
								<>
									{!canClose &&
										(workBook._count.milestones > 0 ? (
											<ActivityForm
												userId={userId}
												startDate={new Date()}
												workOrderId={workBook.id}
												entryType="DAILY_ACTIVITY"
											/>
										) : (
											<Alert>
												<InfoIcon className="h-4 w-4" />
												<AlertTitle>
													Debe crear su(s) hito(s) para agregar actividades diarias
												</AlertTitle>
											</Alert>
										))}

									{hasPermission && (
										<>
											<ActivityForm
												userId={userId}
												startDate={new Date()}
												workOrderId={workBook.id}
												entryType="ADDITIONAL_ACTIVITY"
											/>

											<OtcInspectorForm userId={userId} workOrderId={workBook.id} />

											{hasPermission &&
												userId === workBook.responsibleId &&
												workBook.status === WORK_ORDER_STATUS.CLOSURE_REQUESTED && (
													<ApproveWorkBookClosure workOrderId={workBook.id} userId={userId} />
												)}
										</>
									)}
								</>
							)}
						</div>
					</div>

					<WorkBookEntriesTable workOrderId={workBook.id} />
				</TabsContent>
			</Tabs>
		</>
	)
}
