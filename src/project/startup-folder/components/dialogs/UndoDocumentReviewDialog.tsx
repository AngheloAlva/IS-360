"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogFooter,
	DialogContent,
	DialogDescription,
	DialogTrigger,
} from "@/shared/components/ui/dialog"

import type { DocumentCategory } from "@prisma/client"
import { Undo2Icon } from "lucide-react"

interface UndoDocumentReviewDialogProps {
	userId: string
	documents: Array<{
		id: string
		name: string
	}>
	onSuccess: () => void
	category: DocumentCategory
}

export function UndoDocumentReviewDialog({
	userId,
	category,
	documents,
	onSuccess,
}: UndoDocumentReviewDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const handleSubmit = async () => {
		setIsSubmitting(true)

		try {
			let result: { ok: boolean; message?: string }
			const documentIds = documents.map((doc) => doc.id)

			if (category === "SAFETY_AND_HEALTH") {
				const { undoSafetyDocumentReview } = await import(
					"@/project/startup-folder/actions/safety-and-health/update-safety-document-status"
				)
				result = await undoSafetyDocumentReview({
					userId,
					documentIds,
				})
			} else if (category === "VEHICLES") {
				const { undoVehicleDocumentReview } = await import(
					"@/project/startup-folder/actions/vehicle/update-vehicle-document-status"
				)
				result = await undoVehicleDocumentReview({
					userId,
					documentIds,
				})
			} else if (category === "PERSONNEL") {
				const { undoWorkerDocumentReview } = await import(
					"@/project/startup-folder/actions/worker/update-worker-document-status"
				)
				result = await undoWorkerDocumentReview({
					userId,
					documentIds,
				})
			} else if (category === "ENVIRONMENTAL") {
				const { undoEnvironmentalDocumentReview } = await import(
					"@/project/startup-folder/actions/environmental/update-environmental-document-status"
				)
				result = await undoEnvironmentalDocumentReview({
					userId,
					documentIds,
				})
			} else if (category === "ENVIRONMENT") {
				const { undoEnvironmentDocumentReview } = await import(
					"@/project/startup-folder/actions/environment/update-environment-document-status"
				)
				result = await undoEnvironmentDocumentReview({
					userId,
					documentIds,
				})
			} else if (category === "TECHNICAL_SPECS") {
				const { undoTechnicalDocumentReview } = await import(
					"@/project/startup-folder/actions/technical-specs/update-technical-document-status"
				)
				result = await undoTechnicalDocumentReview({
					userId,
					documentIds,
				})
			} else if (category === "BASIC") {
				const { undoDocumentReview } = await import(
					"@/project/startup-folder/actions/basic/update-basic-document-status"
				)
				result = await undoDocumentReview({
					userId,
					documentIds,
				})
			} else {
				result = {
					ok: false,
					message: "Categoría de documento no soportada",
				}
			}

			if (result.ok) {
				toast.success("Revisión revertida correctamente")
				onSuccess()
				setOpen(false)
			} else {
				toast.error(result.message || "Error al revertir la revisión")
			}
		} catch (error) {
			console.error("Error reverting document review:", error)
			toast.error("Error al revertir la revisión")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size={"icon"} variant="outline" className="size-8">
					<Undo2Icon className="h-4 w-4" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Revertir Revisión de Documentos</DialogTitle>
					<DialogDescription asChild>
						<div>
							¿Estás seguro(a) de que deseas revertir la revisión de estos documentos? Los
							documentos volverán al estado de{" "}
							<span className="font-semibold">&quot;Enviado para revisión&quot;</span>.
							<ul className="mt-4 flex flex-col items-start justify-start">
								<span className="font-semibold">Documentos:</span>

								{documents.map((doc) => (
									<li key={doc.id}>- {doc.name}</li>
								))}
							</ul>
						</div>
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="mt-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isSubmitting}
					>
						Cancelar
					</Button>
					<Button
						className="bg-amber-600 transition-all hover:scale-105 hover:bg-amber-700 hover:text-white"
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Revirtiendo..." : "Revertir revisiones"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
