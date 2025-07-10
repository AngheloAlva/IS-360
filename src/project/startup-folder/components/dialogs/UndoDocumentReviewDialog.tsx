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
} from "@/shared/components/ui/dialog"

import type { DocumentCategory } from "@prisma/client"

interface UndoDocumentReviewDialogProps {
	userId: string
	isOpen: boolean
	documentId: string
	onClose: () => void
	onSuccess: () => void
	category: DocumentCategory
}

export function UndoDocumentReviewDialog({
	userId,
	isOpen,
	onClose,
	category,
	documentId,
	onSuccess,
}: UndoDocumentReviewDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async () => {
		setIsSubmitting(true)

		try {
			let result: { ok: boolean; message?: string }

			if (category === "SAFETY_AND_HEALTH") {
				const { undoSafetyDocumentReview } = await import(
					"@/project/startup-folder/actions/safety-and-health/update-safety-document-status"
				)
				result = await undoSafetyDocumentReview({
					userId,
					documentId,
				})
			} else if (category === "VEHICLES") {
				const { undoVehicleDocumentReview } = await import(
					"@/project/startup-folder/actions/vehicle/update-vehicle-document-status"
				)
				result = await undoVehicleDocumentReview({
					userId,
					documentId,
				})
			} else if (category === "PERSONNEL") {
				const { undoWorkerDocumentReview } = await import(
					"@/project/startup-folder/actions/worker/update-worker-document-status"
				)
				result = await undoWorkerDocumentReview({
					userId,
					documentId,
				})
			} else if (category === "ENVIRONMENTAL") {
				const { undoEnvironmentalDocumentReview } = await import(
					"@/project/startup-folder/actions/environmental/update-environmental-document-status"
				)
				result = await undoEnvironmentalDocumentReview({
					userId,
					documentId,
				})
			} else if (category === "ENVIRONMENT") {
				const { undoEnvironmentDocumentReview } = await import(
					"@/project/startup-folder/actions/environment/update-environment-document-status"
				)
				result = await undoEnvironmentDocumentReview({
					userId,
					documentId,
				})
			} else if (category === "TECHNICAL_SPECS") {
				const { undoTechnicalDocumentReview } = await import(
					"@/project/startup-folder/actions/technical-specs/update-technical-document-status"
				)
				result = await undoTechnicalDocumentReview({
					userId,
					documentId,
				})
			} else if (category === "BASIC") {
				const { undoDocumentReview } = await import(
					"@/project/startup-folder/actions/basic/update-basic-document-status"
				)
				result = await undoDocumentReview({
					userId,
					documentId,
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
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Revertir revisión de documento</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas revertir la revisión de este documento? El documento volverá
						al estado de <span className="font-semibold">&quot;Enviado para revisión&quot;</span>.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
						Cancelar
					</Button>
					<Button
						className="bg-amber-600 transition-all hover:scale-105 hover:bg-amber-700 hover:text-white"
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Revirtiendo..." : "Revertir revisión"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
