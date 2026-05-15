"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { SendIcon } from "lucide-react"
import { toast } from "sonner"

import {
	WORK_BOOK_TUTORIAL_SLUG,
	type WorkBookTutorialSlug,
} from "@/project/tutorials/work-book/tutorials"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
	Dialog,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import MilestonesForm from "@/project/work-order/components/forms/MilestonesForm"
import ActivityForm from "@/project/work-order/components/forms/WorkBookActivityForm"
import InternalInspectorForm from "@/project/work-order/components/forms/InternalInspectorForm"
import type { Milestone } from "@/project/work-order/hooks/use-work-book-milestones"
import { MILESTONE_STATUS } from "@/generated/prisma/enums"

interface WorkBookTutorialDetailSandboxProps {
	tutorialSlug: WorkBookTutorialSlug
}

interface TutorialMilestone {
	id: string
	name: string
	activitiesCount: number
	approvalRequested: boolean
}

interface InspectionCommentItem {
	id: string
	author: "CONTRACTOR" | "INTERNAL"
	content: string
	status?: "APROBADO" | "RECHAZADO"
}

const PRESET_MILESTONES: TutorialMilestone[] = [
	{
		id: "milestone-1",
		name: "Hito 1 - Preparacion de area",
		activitiesCount: 2,
		approvalRequested: false,
	},
	{
		id: "milestone-2",
		name: "Hito 2 - Ejecucion de trabajo",
		activitiesCount: 3,
		approvalRequested: false,
	},
	{
		id: "milestone-3",
		name: "Hito 3 - Cierre y limpieza",
		activitiesCount: 2,
		approvalRequested: false,
	},
]

export default function WorkBookTutorialDetailSandbox({
	tutorialSlug,
}: WorkBookTutorialDetailSandboxProps): React.ReactElement {
	const [activeTab, setActiveTab] = useState(() =>
		tutorialSlug === WORK_BOOK_TUTORIAL_SLUG.RESPOND_INSPECTIONS ? "inspections" : "milestones"
	)
	const [milestones, setMilestones] = useState<TutorialMilestone[]>(() => {
		if (tutorialSlug === WORK_BOOK_TUTORIAL_SLUG.REQUEST_APPROVAL) {
			return PRESET_MILESTONES
		}

		return []
	})
	const [activitiesCreated, setActivitiesCreated] = useState(0)
	const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
	const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)
	const [inspectionComments, setInspectionComments] = useState<InspectionCommentItem[]>([
		{
			id: "inspection-comment-1",
			author: "INTERNAL",
			content: "Se detecta observacion de seguridad en el uso de EPP.",
			status: "RECHAZADO",
		},
	])

	const approvalProgress = useMemo(() => {
		if (milestones.length === 0) {
			return 0
		}

		const sentCount = milestones.filter((milestone) => milestone.approvalRequested).length
		return Math.round((sentCount / milestones.length) * 100)
	}, [milestones])

	const activeInspectionStatus = useMemo(() => {
		const lastComment = inspectionComments.at(-1)

		if (!lastComment) {
			return "SIN RESPUESTAS"
		}

		if (lastComment.status === "APROBADO") {
			return "CERRADA"
		}

		if (lastComment.status === "RECHAZADO") {
			return "REQUIERE RESPUESTA CONTRATISTA"
		}

		if (lastComment.author === "CONTRACTOR") {
			return "EN REVISION INTERNA"
		}

		return "EN PROCESO"
	}, [inspectionComments])

	const canShowApprovalTutorial = tutorialSlug === WORK_BOOK_TUTORIAL_SLUG.REQUEST_APPROVAL
	const canShowInspectionsTutorial = tutorialSlug === WORK_BOOK_TUTORIAL_SLUG.RESPOND_INSPECTIONS

	const tutorialMilestonesForForms = useMemo<Milestone[]>(() => {
		return milestones.map((milestone, index) => ({
			id: milestone.id,
			name: milestone.name,
			description: "Hito de entrenamiento",
			order: index + 1,
			closureComment: null,
			isCompleted: false,
			status: MILESTONE_STATUS.IN_PROGRESS,
			weight: 33.3,
			startDate: new Date(),
			endDate: new Date(),
			workOrderId: "tutorial-workbook",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			activities: [],
		}))
	}, [milestones])

	const handleOpenApprovalDialog = (milestoneId: string) => {
		setSelectedMilestoneId(milestoneId)
		setApprovalDialogOpen(true)
	}

	const handleConfirmApproval = () => {
		if (!selectedMilestoneId) {
			return
		}

		setMilestones((previous) =>
			previous.map((milestone) =>
				milestone.id === selectedMilestoneId ? { ...milestone, approvalRequested: true } : milestone
			)
		)
		setApprovalDialogOpen(false)
		setSelectedMilestoneId(null)
		toast.success("Hito enviado a aprobacion (simulado)")
	}

	const handleContractorResponse = () => {
		setInspectionComments((previous) => [
			...previous,
			{
				id: crypto.randomUUID(),
				author: "CONTRACTOR",
				content: "Se corrige observacion y se adjunta evidencia en la respuesta.",
			},
		])
		toast.success("Respuesta del contratista enviada")
	}

	const handleInternalReview = (status: "APROBADO" | "RECHAZADO") => {
		setInspectionComments((previous) => [
			...previous,
			{
				id: crypto.randomUUID(),
				author: "INTERNAL",
				content:
					status === "APROBADO"
						? "El responsable interno aprueba la respuesta y cierra la inspeccion."
						: "El responsable interno rechaza y solicita nueva respuesta del contratista.",
				status,
			},
		])
		toast.success(
			status === "APROBADO" ? "Revision interna aprobada" : "Revision interna rechazada para reingreso"
		)
	}

	return (
		<div className="space-y-4">
			<div className="rounded-lg bg-linear-to-r from-orange-600 to-red-600 p-6 text-white shadow-lg">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold">Libro de Obras de Entrenamiento</h2>
						<p className="text-sm opacity-90">OT-2026-0099 - Planta Maipu</p>
					</div>
					<div className="rounded-md bg-white/20 px-3 py-1 text-sm font-semibold">
						{format(new Date(), "dd MMM yyyy", { locale: es })}
					</div>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
					{canShowInspectionsTutorial && (
						<TabsTrigger
							value="inspections"
							className="h-9"
							data-tutorial-id="tutorial-tab-inspections"
						>
							Inspecciones
						</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value="milestones" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Hitos del Libro</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{milestones.length === 0 ? (
								<div
									className="rounded-lg border border-dashed p-5 text-sm text-slate-600 dark:text-slate-300"
									data-tutorial-id="tutorial-milestone-empty-state"
								>
									No hay hitos creados para este libro de ejemplo.
								</div>
							) : (
								<div className="space-y-3" data-tutorial-id="tutorial-approval-list">
									{milestones.map((milestone) => (
										<div
											key={milestone.id}
											className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
										>
											<div>
												<p className="font-semibold">{milestone.name}</p>
												<p className="text-muted-foreground text-sm">
													{milestone.activitiesCount} actividades asociadas
												</p>
											</div>
											<div className="flex items-center gap-2">
												{milestone.approvalRequested ? (
													<Badge className="bg-emerald-500/10 text-emerald-600">
														En aprobacion
													</Badge>
												) : (
													<Badge variant="outline">Pendiente</Badge>
												)}

												{canShowApprovalTutorial && (
													<Button
														type="button"
														className="bg-orange-600 hover:bg-orange-700"
														disabled={milestone.activitiesCount <= 1 || milestone.approvalRequested}
														onClick={() => handleOpenApprovalDialog(milestone.id)}
														data-tutorial-id="tutorial-send-approval"
													>
														<SendIcon className="size-4" />
														Enviar a Aprobacion
													</Button>
												)}
											</div>
										</div>
									))}
								</div>
							)}

							{tutorialSlug === WORK_BOOK_TUTORIAL_SLUG.CREATE_MILESTONES && (
								<MilestonesForm
									workOrderId="tutorial-workbook"
									workOrderStartDate={new Date()}
									tutorialMode
									triggerDataTutorialId="tutorial-create-milestones"
									contentDataTutorialId="tutorial-milestones-sheet"
									submitDataTutorialId="tutorial-milestones-submit"
									tutorialDefaultMilestones={[
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
									]}
									onTutorialSubmit={() => {
										setMilestones(PRESET_MILESTONES)
									}}
								/>
							)}

							{canShowApprovalTutorial && (
								<div
									className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100"
									data-tutorial-id="tutorial-approval-note"
								>
									Avance de envio: {approvalProgress}%. Al aprobar todos los hitos, el libro queda
									en 100% automaticamente.
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="activities" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Actividades Diarias</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<ActivityForm
								userId="tutorial-user"
								companyId="tutorial-company"
								entryType="DAILY_ACTIVITY"
								workOrderId="tutorial-workbook"
								startDate={new Date()}
								tutorialMode
								triggerDataTutorialId="tutorial-create-activity"
								tutorialMilestones={tutorialMilestonesForForms}
								tutorialUsers={[
									{ id: "u-1", name: "Juan Soto" },
									{ id: "u-2", name: "Maria Rojas" },
								]}
								tutorialDefaultValues={{
									activityName: "Mantenimiento de estructura",
									comments: "Actividad de ejemplo para entrenamiento",
									milestoneId: tutorialMilestonesForForms[0]?.id,
									personnel: [{ userId: "u-1" }, { userId: "u-2" }],
								}}
								onTutorialSubmit={() => {
									setActivitiesCreated((previous) => previous + 1)
								}}
							/>

							<div className="rounded-lg border p-3 text-sm">
								Se han creado {activitiesCreated} actividades de ejemplo en este tutorial.
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{canShowInspectionsTutorial && (
					<TabsContent value="inspections" className="space-y-4">
						<Card data-tutorial-id="tutorial-inspection-list">
							<CardHeader>
								<CardTitle>Inspecciones de Seguridad</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div
									className="flex items-center gap-2"
									data-tutorial-id="tutorial-inspection-status"
								>
									<Badge variant="outline">Estado: {activeInspectionStatus}</Badge>
								</div>

								<div className="space-y-2">
									{inspectionComments.map((comment) => (
										<div key={comment.id} className="rounded-lg border p-3 text-sm">
											<p className="font-semibold">{comment.author}</p>
											<p className="text-muted-foreground">{comment.content}</p>
											{comment.status && (
												<Badge variant="outline" className="mt-2">
													{comment.status}
												</Badge>
											)}
										</div>
									))}
								</div>

								<div className="flex flex-wrap gap-2">
									<InternalInspectorForm
										workOrderId="tutorial-workbook"
										tutorialMode
										triggerDataTutorialId="tutorial-inspection-create"
										contentDataTutorialId="tutorial-inspection-sheet"
										submitDataTutorialId="tutorial-inspection-submit"
										tutorialMilestones={tutorialMilestonesForForms}
									/>
									<Button
										type="button"
										variant="outline"
										onClick={handleContractorResponse}
										data-tutorial-id="tutorial-inspection-respond"
									>
										Responder como contratista
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => handleInternalReview("RECHAZADO")}
										data-tutorial-id="tutorial-inspection-review"
									>
										Interno rechaza
									</Button>
									<Button
										type="button"
										onClick={() => handleInternalReview("APROBADO")}
										className="bg-emerald-600 hover:bg-emerald-700"
									>
										Interno aprueba y cierra
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				)}
			</Tabs>

			<Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
				<DialogContent data-tutorial-id="tutorial-approval-dialog">
					<DialogHeader>
						<DialogTitle>Confirmar envio a aprobacion</DialogTitle>
						<DialogDescription>
							Esta accion esta simulada para capacitacion y no impacta datos reales.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
							Cancelar
						</Button>
						<Button
							data-tutorial-id="tutorial-approval-confirm"
							className="bg-orange-600 hover:bg-orange-700"
							onClick={handleConfirmApproval}
						>
							Confirmar envio
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
