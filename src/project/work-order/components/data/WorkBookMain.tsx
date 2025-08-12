"use client"

import { InfoIcon, ListOrderedIcon } from "lucide-react"
import { subDays } from "date-fns"

import { useWorkBookById } from "@/project/work-order/hooks/use-work-book-by-id"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WORK_ORDER_STATUS } from "@prisma/client"

import { ApproveWorkBookClosure } from "@/project/work-order/components/forms/ApproveWorkBookClosure"
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsContents } from "@/shared/components/ui/tabs"
import WorkBookEntriesTable from "@/project/work-order/components/data/WorkBookEntriesTable"
import WorkBookGeneralData from "@/project/work-order/components/data/WorkBookGeneralData"
import WorkBookMilestones from "@/project/work-order/components/data/WorkBookMilestones"
import OtcInspectorForm from "@/project/work-order/components/forms/OtcInspectorForm"
import ActivityForm from "@/project/work-order/components/forms/WorkBookActivityForm"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"
import { Alert, AlertTitle } from "@/shared/components/ui/alert"
import { Progress } from "@/shared/components/ui/progress"
import { Skeleton } from "@/shared/components/ui/skeleton"
import BackButton from "@/shared/components/BackButton"
import { Badge } from "@/shared/components/ui/badge"

interface WorkBookMainProps {
	userId: string
	userRole: string
	workBookId: string
	isOtcMember?: boolean
	hasPermission: boolean
	hassWorkBookPermission: boolean
}

export default function WorkBookMain({
	userId,
	userRole,
	workBookId,
	hasPermission,
	isOtcMember = false,
	hassWorkBookPermission,
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
	const canRequestClosure = hassWorkBookPermission || workBook.workProgressStatus === 100

	return (
		<>
			<div className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white shadow-lg">
				<div className="flex items-center gap-3">
					<BackButton
						href={
							userRole === "partnerCompany"
								? "/dashboard/libro-de-obras"
								: "/admin/dashboard/ordenes-de-trabajo"
						}
						className="bg-white/30 text-white hover:bg-white/50"
					/>

					<div>
						<h1 className="text-2xl font-bold">
							{workBook.workName || "Libro de Obras no creado"}
						</h1>
						<p className="text-feature text-base font-bold">{workBook.otNumber}</p>
					</div>
				</div>

				<div className="flex w-full flex-col items-end gap-2 md:w-64">
					<Badge className="bg-white font-semibold text-orange-500">
						{WorkOrderStatusLabels[workBook.status as keyof typeof WorkOrderStatusLabels]}
					</Badge>

					<div className="flex items-center justify-between gap-2">
						<span className="text-sm font-medium">Progreso del trabajo:</span>
						<span className="text-sm font-bold">{workBook.workProgressStatus || 0}%</span>
					</div>
					<Progress
						value={workBook.workProgressStatus || 0}
						className="h-2 bg-white/40"
						indicatorClassName={`bg-white ${
							workBook.workProgressStatus && workBook.workProgressStatus > 50
								? "bg-green-500"
								: "bg-yellow-500"
						}`}
					/>
				</div>
			</div>

			<WorkBookGeneralData data={workBook} userId={userId} hasPermission={hasPermission} />

			<Tabs defaultValue="milestones" className="w-full">
				<TabsList className="h-11 w-full">
					<TabsTrigger value="milestones" className="h-9">
						Carta Gantt / Hitos
					</TabsTrigger>
					<TabsTrigger value="activities" className="h-9">
						Registro Actividades Diarias
					</TabsTrigger>
				</TabsList>

				<TabsContents>
					<TabsContent value="milestones">
						<WorkBookMilestones
							userId={userId}
							userRole={userRole}
							isOtcMember={isOtcMember}
							workOrderId={workBook.id}
							hasPermission={hasPermission}
							supervisorId={workBook.supervisorId}
							canRequestClosure={canRequestClosure}
							responsibleId={workBook.responsibleId}
							hassWorkBookPermission={hassWorkBookPermission}
							workOrderStartDate={subDays(workBook.workStartDate || new Date(), 1)}
						/>
					</TabsContent>

					<TabsContent value="activities">
						<Card className="gap-4">
							<CardHeader className="flex w-full flex-row items-center justify-between gap-2">
								<h2 className="text-text flex items-center gap-2 text-2xl font-bold">
									<div className="size-10 rounded-md bg-red-500/10 p-1.5">
										<ListOrderedIcon className="h-auto w-full text-red-500" />
									</div>
									Detalle de Trabajo Diario
								</h2>

								<div className="flex gap-2">
									{canAddActivities && (
										<>
											{!canRequestClosure &&
												(workBook._count.milestones > 0 ? (
													<ActivityForm
														userId={userId}
														startDate={new Date()}
														workOrderId={workBook.id}
														entryType="DAILY_ACTIVITY"
													/>
												) : (
													workBook.supervisorId === userId && (
														<Alert>
															<InfoIcon className="h-4 w-4" />
															<AlertTitle>
																Debe crear su(s) hito(s) para agregar actividades diarias
															</AlertTitle>
														</Alert>
													)
												))}
										</>
									)}

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
								</div>
							</CardHeader>

							<CardContent>
								<WorkBookEntriesTable
									userId={userId}
									isOtcMember={isOtcMember}
									workOrderId={workBook.id}
									hasPermission={hasPermission}
									workOrderNumber={workBook.otNumber}
								/>
							</CardContent>
						</Card>
					</TabsContent>
				</TabsContents>
			</Tabs>
		</>
	)
}
