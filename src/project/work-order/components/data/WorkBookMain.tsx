"use client"

import { AlertTriangleIcon, InfoIcon, ListOrderedIcon } from "lucide-react"
import { subDays } from "date-fns"

import { useWorkBookById } from "@/project/work-order/hooks/use-work-book-by-id"
import type { WorkBookById } from "@/project/work-order/hooks/use-work-book-by-id"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WORK_ORDER_STATUS } from "@/generated/prisma/enums"
import type { Milestone } from "@/project/work-order/hooks/use-work-book-milestones"
import type { WorkEntry } from "@/project/work-order/hooks/use-work-entries"
import type { WorkBookTutorialSlug } from "@/project/tutorials/work-book/tutorials"

import { ApproveWorkBookClosure } from "@/project/work-order/components/forms/ApproveWorkBookClosure"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import WorkBookEntriesTable from "@/project/work-order/components/data/WorkBookEntriesTable"
import WorkBookGeneralData from "@/project/work-order/components/data/WorkBookGeneralData"
import WorkBookMilestones from "@/project/work-order/components/data/WorkBookMilestones"
import InternalInspectorForm from "@/project/work-order/components/forms/InternalInspectorForm"
import ActivityForm from "@/project/work-order/components/forms/WorkBookActivityForm"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertTitle } from "@/shared/components/ui/alert"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { Progress } from "@/shared/components/ui/progress"
import { Skeleton } from "@/shared/components/ui/skeleton"
import BackButton from "@/shared/components/BackButton"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/lib/utils"

interface WorkBookMainProps {
	userId: string
	userRole: string
	workBookId: string
	isInternalMember?: boolean
	hasPermission: boolean
	hassWorkBookPermission: boolean
	tutorialMode?: boolean
	tutorialWorkBook?: WorkBookById
	tutorialMilestones?: Milestone[]
	tutorialEntries?: WorkEntry[]
	onTutorialMilestonesChange?: (milestones: Milestone[]) => void
	onTutorialMilestoneRequestClose?: (milestoneId: string) => void
	tutorialSlug?: WorkBookTutorialSlug
}

export default function WorkBookMain({
	userId,
	userRole,
	workBookId,
	hasPermission,
	isInternalMember = false,
	hassWorkBookPermission,
	tutorialMode = false,
	tutorialWorkBook,
	tutorialMilestones,
	tutorialEntries,
	onTutorialMilestonesChange,
	onTutorialMilestoneRequestClose,
	tutorialSlug,
}: WorkBookMainProps): React.ReactElement {
	const { data, isLoading, isError, isFetching } = useWorkBookById({
		workOrderId: workBookId,
		enabled: !tutorialMode,
	})

	const workBook = tutorialMode ? tutorialWorkBook : data?.workBook

	if (!tutorialMode && (isLoading || isFetching)) {
		return (
			<div className="w-full space-y-4">
				<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-3">
						<BackButton href="/dashboard/libro-de-obras" />

						<div>
							<h1 className="text-2xl font-bold">
								<Skeleton className="h-6 w-40 rounded" />
							</h1>
							<div className="mt-1 text-base font-semibold">
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

	if ((!tutorialMode && isError) || !workBook) {
		return (
			<div className="w-full rounded-md border border-amber-200 bg-amber-50 p-4">
				<h2 className="text-lg font-semibold text-amber-800">Error al cargar el libro de obras</h2>
				<p className="text-sm text-amber-700">
					No se pudo cargar el libro de obras. Por favor, intente nuevamente.
				</p>
			</div>
		)
	}

	const canAddActivities =
		workBook.status === WORK_ORDER_STATUS.IN_PROGRESS ||
		workBook.status === WORK_ORDER_STATUS.PLANNED ||
		workBook.status === WORK_ORDER_STATUS.PENDING
	const isMilestonesTutorial = tutorialMode && tutorialSlug === "crear-hitos-y-actividades"
	const canRequestClosure = workBook.progress === 100

	return (
		<>
			<div
				data-tutorial-id="tutorial-workbook-header"
				className="flex w-full items-center justify-between rounded-lg bg-linear-to-r from-orange-600 to-red-600 p-6 text-white shadow-lg dark:from-orange-800 dark:to-red-800"
			>
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
							{workBook.workBookName || "Libro de Obras no creado"}
						</h1>
						<p className="text-feature text-base font-bold">{workBook.otNumber}</p>
					</div>
				</div>

				<div className="flex w-full flex-col items-end gap-2 md:w-64">
					<Badge className="bg-white font-semibold text-orange-500">
						{WorkOrderStatusLabels[workBook.status as keyof typeof WorkOrderStatusLabels]}
					</Badge>

					<div className="flex items-center justify-between gap-2">
						<span className="text-sm font-semibold">Progreso del trabajo:</span>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="cursor-help text-sm font-bold underline decoration-dotted">
										{workBook.progress || 0}%
									</span>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									El porcentaje se calcula como la suma de los pesos de los hitos aprobados. Al
									aprobarse el último hito, la OT se cerrará automáticamente.
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<Progress
						value={workBook.progress || 0}
						className={cn("h-2 bg-white/40 [&>div]:bg-yellow-500", {
							"[&>div]:bg-green-500 dark:[&>div]:bg-emerald-700":
								workBook.progress && workBook.progress > 50,
						})}
					/>
				</div>
			</div>

			{!workBook.companyId && (
				<Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
					<AlertTriangleIcon className="h-4 w-4" />
					<AlertTitle>
						Esta OT no tiene una empresa contratista asignada. Algunas acciones pueden estar
						limitadas.
					</AlertTitle>
				</Alert>
			)}

			{workBook.company && !workBook.company.isActive && (
				<Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
					<AlertTriangleIcon className="h-4 w-4" />
					<AlertTitle>
						La empresa asociada ({workBook.company.name}) está inactiva. Algunas acciones pueden
						estar limitadas.
					</AlertTitle>
				</Alert>
			)}

			<WorkBookGeneralData data={workBook} userId={userId} hasPermission={hasPermission} />

			<Tabs defaultValue="milestones" className="w-full">
				<TabsList className="h-11 w-full">
					<TabsTrigger
						value="milestones"
						className="h-9"
						data-tutorial-id="tutorial-tab-milestones"
					>
						Carta Gantt / Hitos
					</TabsTrigger>
					<TabsTrigger
						value="activities"
						className="h-9"
						data-tutorial-id="tutorial-tab-activities"
					>
						Registro Actividades Diarias
					</TabsTrigger>
				</TabsList>

				<TabsContent value="milestones">
					<WorkBookMilestones
						userRole={userRole}
						isInternalMember={isInternalMember}
						workOrderId={workBook.id}
						hasPermission={hasPermission}
						supervisorId={workBook.supervisorId}
						responsibleId={workBook.responsibleId}
						hassWorkBookPermission={hassWorkBookPermission}
						workOrderStartDate={subDays(workBook.workBookStartDate || new Date(), 1)}
						tutorialMode={tutorialMode}
						tutorialMilestones={tutorialMilestones}
						onTutorialMilestonesSubmit={onTutorialMilestonesChange}
						onTutorialRequestClose={onTutorialMilestoneRequestClose}
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
													companyId={workBook.companyId || undefined}
													tutorialMode={tutorialMode}
													triggerDataTutorialId={
														tutorialMode ? "tutorial-create-activity" : undefined
													}
													tutorialMilestones={tutorialMilestones}
													tutorialUsers={[
														{ id: "u-1", name: "Juan Soto" },
														{ id: "u-2", name: "Maria Rojas" },
													]}
													tutorialDefaultValues={{
														activityName: "Mantenimiento de estructura",
														comments: "Actividad de ejemplo para entrenamiento",
														milestoneId: tutorialMilestones?.[0]?.id,
														personnel: [{ userId: "u-1" }, { userId: "u-2" }],
													}}
													contentDataTutorialId={
														tutorialMode ? "tutorial-activity-sheet" : undefined
													}
													submitDataTutorialId={
														tutorialMode ? "tutorial-activity-submit" : undefined
													}
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

								{hasPermission && !isMilestonesTutorial && (
									<>
										<ActivityForm
											userId={userId}
											startDate={new Date()}
											workOrderId={workBook.id}
											entryType="ADDITIONAL_ACTIVITY"
										/>

										<InternalInspectorForm
											workOrderId={workBook.id}
											tutorialMode={tutorialMode}
											triggerDataTutorialId={
												tutorialMode ? "tutorial-inspection-create" : undefined
											}
											contentDataTutorialId={tutorialMode ? "tutorial-inspection-sheet" : undefined}
											submitDataTutorialId={tutorialMode ? "tutorial-inspection-submit" : undefined}
											tutorialMilestones={tutorialMilestones}
										/>

										{tutorialMode && (
											<>
												<Button
													type="button"
													variant="outline"
													data-tutorial-id="tutorial-inspection-respond"
												>
													Responder como contratista
												</Button>
												<Button
													type="button"
													variant="outline"
													data-tutorial-id="tutorial-inspection-review"
												>
													Revision Interna
												</Button>
												<Badge variant="outline" data-tutorial-id="tutorial-inspection-status">
													Estado: Requiere respuesta contratista
												</Badge>
											</>
										)}

										{hasPermission &&
											userId === workBook.responsibleId &&
											workBook.status === WORK_ORDER_STATUS.CLOSURE_REQUESTED && (
												<ApproveWorkBookClosure workOrderId={workBook.id} />
											)}
									</>
								)}
							</div>
						</CardHeader>

						<CardContent>
							<WorkBookEntriesTable
								userId={userId}
								isInternalMember={isInternalMember}
								workOrderId={workBook.id}
								hasPermission={hasPermission}
								workOrderNumber={workBook.otNumber}
								tutorialMode={tutorialMode}
								tutorialEntries={tutorialEntries}
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</>
	)
}
