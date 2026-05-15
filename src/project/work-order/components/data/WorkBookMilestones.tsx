"use client"

import { FolderKanbanIcon } from "lucide-react"

import { useWorkBookMilestones } from "@/project/work-order/hooks/use-work-book-milestones"
import type { Milestone } from "@/project/work-order/hooks/use-work-book-milestones"

import MilestonesForm from "@/project/work-order/components/forms/MilestonesForm"
import MilestoneCards from "@/project/work-order/components/data/MilestoneCards"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface WorkBookMilestonesProps {
	userRole: string
	workOrderId: string
	supervisorId: string
	isOtcMember?: boolean
	responsibleId: string
	hasPermission: boolean
	workOrderStartDate: Date
	hassWorkBookPermission: boolean
	tutorialMode?: boolean
	tutorialMilestones?: Milestone[]
	onTutorialMilestonesSubmit?: (milestones: Milestone[]) => void
	onTutorialRequestClose?: (milestoneId: string) => void
}

export default function WorkBookMilestones({
	userRole,
	workOrderId,
	isOtcMember,
	supervisorId,
	responsibleId,
	hasPermission,
	workOrderStartDate,
	hassWorkBookPermission,
	tutorialMode = false,
	tutorialMilestones,
	onTutorialMilestonesSubmit,
	onTutorialRequestClose,
}: WorkBookMilestonesProps) {
	const { data, isLoading, isError } = useWorkBookMilestones({
		workOrderId,
		showAll: true,
		enabled: !tutorialMode,
	})

	const milestonesData = tutorialMode ? (tutorialMilestones ?? []) : (data?.milestones ?? [])
	const milestonesInitialData = tutorialMode ? undefined : data?.milestones

	if (!tutorialMode && isLoading) {
		return (
			<Card className="w-full">
				<CardHeader className="flex items-center justify-between">
					<h2 className="text-2xl font-bold">Hitos</h2>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[...Array(3)].map((_, index) => (
							<Skeleton key={index} className="h-48 w-full rounded-lg" />
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!tutorialMode && isError) {
		return (
			<Card className="w-full">
				<CardHeader className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-amber-800">Error al cargar los hitos</h2>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-amber-700">
						No se pudieron cargar los hitos. Por favor, intente nuevamente.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="w-full gap-4">
			<CardHeader className="flex flex-row items-center justify-between">
				<h2 className="flex items-center gap-2 text-2xl font-bold">
					<div className="size-10 rounded-md bg-orange-500/10 p-1.5">
						<FolderKanbanIcon className="h-auto w-full text-orange-500" />
					</div>
					Planificación de trabajo
				</h2>

				<div className="flex items-center gap-2">
					<MilestonesForm
						workOrderId={workOrderId}
						initialData={milestonesInitialData}
						workOrderStartDate={workOrderStartDate}
						tutorialMode={tutorialMode}
						triggerDataTutorialId={tutorialMode ? "tutorial-create-milestones" : undefined}
						contentDataTutorialId={tutorialMode ? "tutorial-milestones-sheet" : undefined}
						submitDataTutorialId={tutorialMode ? "tutorial-milestones-submit" : undefined}
						tutorialDefaultMilestones={
							tutorialMode
								? [
										{
											name: "Hito 1 - Preparacion de area",
											weight: "33.3",
											description: "Preparar zona y validar condiciones iniciales.",
											activityCount: 0,
											startDate: new Date(),
											endDate: new Date(),
										},
										{
											name: "Hito 2 - Ejecucion de trabajo",
											weight: "33.3",
											description: "Ejecutar actividades planificadas del trabajo.",
											activityCount: 0,
											startDate: new Date(),
											endDate: new Date(),
										},
										{
											name: "Hito 3 - Cierre y limpieza",
											weight: "33.4",
											description: "Cerrar tareas y dejar evidencia final.",
											activityCount: 0,
											startDate: new Date(),
											endDate: new Date(),
										},
									]
								: undefined
						}
						onTutorialSubmit={(values) => {
							onTutorialMilestonesSubmit?.(
								values.milestones.map((milestone, index) => ({
									id: `tutorial-milestone-${index + 1}`,
									name: milestone.name,
									description: milestone.description ?? null,
									order: index + 1,
									closureComment: null,
									isCompleted: false,
									status: "IN_PROGRESS",
									weight: Number(milestone.weight) || 0,
									startDate: milestone.startDate ?? null,
									endDate: milestone.endDate ?? null,
									workOrderId,
									createdAt: new Date().toISOString(),
									updatedAt: new Date().toISOString(),
									activities: [],
								}))
							)
						}}
					/>

				</div>
			</CardHeader>

			<CardContent>
				{tutorialMode && milestonesData.length > 0 && (
					<div
						data-tutorial-id="tutorial-approval-note"
						className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100"
					>
						Cuando todos los hitos se envian y aprueban, el libro queda en 100%.
					</div>
				)}

				<MilestoneCards
					userRole={userRole}
					workOrderId={workOrderId}
					isOtcMember={isOtcMember}
					supervisorId={supervisorId}
					responsibleId={responsibleId}
					hasPermission={hasPermission}
					milestones={milestonesData}
					hassWorkBookPermission={hassWorkBookPermission}
					tutorialMode={tutorialMode}
					onTutorialRequestClose={onTutorialRequestClose}
					requestCloseTriggerDataTutorialId={tutorialMode ? "tutorial-send-approval" : undefined}
					requestCloseDialogDataTutorialId={tutorialMode ? "tutorial-approval-dialog" : undefined}
					requestCloseConfirmDataTutorialId={tutorialMode ? "tutorial-approval-confirm" : undefined}
				/>
			</CardContent>
		</Card>
	)
}
