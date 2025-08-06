"use client"

import { FileSymlinkIcon } from "lucide-react"
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

interface UpdateDocumentStatusDialogProps {
	startupFolderId: string
	documents: Array<{
		id: string
		name: string
	}>
	onSuccess: () => void
	category: DocumentCategory
}

export function UpdateDocumentStatusDialog({
	startupFolderId,
	category,
	documents,
	onSuccess,
}: UpdateDocumentStatusDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const handleSubmit = async () => {
		setIsSubmitting(true)

		try {
			let result: { ok: boolean; message?: string }
			const documentIds = documents.map((doc) => doc.id)

			if (category === "SAFETY_AND_HEALTH") {
				const { updateSafetyDocumentToUpdate } = await import(
					"@/project/startup-folder/actions/safety-and-health/update-safety-document-to-update"
				)
				result = await updateSafetyDocumentToUpdate({
					documentIds,
					startupFolderId,
				})
			} else if (category === "VEHICLES") {
				const { updateVehicleDocumentToUpdate } = await import(
					"@/project/startup-folder/actions/vehicle/update-vehicle-document-to-update"
				)
				result = await updateVehicleDocumentToUpdate({
					documentIds,
					startupFolderId,
				})
			} else if (category === "PERSONNEL") {
				const { updateWorkerDocumentToUpdate } = await import(
					"@/project/startup-folder/actions/worker/update-worker-document-to-update"
				)
				result = await updateWorkerDocumentToUpdate({
					documentIds,
					startupFolderId,
				})
			} else if (category === "ENVIRONMENTAL") {
				const { updateEnvironmentalDocumentToUpdate } = await import(
					"@/project/startup-folder/actions/environmental/update-environmental-document-to-update"
				)
				result = await updateEnvironmentalDocumentToUpdate({
					documentIds,
					startupFolderId,
				})
			} else if (category === "ENVIRONMENT") {
				const { updateEnvironmentDocumentToUpdate } = await import(
					"@/project/startup-folder/actions/environment/update-environment-document-to-update"
				)
				result = await updateEnvironmentDocumentToUpdate({
					documentIds,
					startupFolderId,
				})
			} else if (category === "TECHNICAL_SPECS") {
				const { updateTechnicalDocumentToUpdate } = await import(
					"@/project/startup-folder/actions/technical-specs/update-technical-document-to-update"
				)
				result = await updateTechnicalDocumentToUpdate({
					documentIds,
					startupFolderId,
				})
			} else if (category === "BASIC") {
				const { updateBasicDocumentToUpdate } = await import(
					"@/project/startup-folder/actions/basic/update-basic-document-to-update"
				)
				result = await updateBasicDocumentToUpdate({
					documentIds,
					startupFolderId,
				})
			} else {
				result = {
					ok: false,
					message: "Categoría de documento no soportada",
				}
			}

			if (result.ok) {
				toast.success("Documentos marcados para actualización correctamente")
				onSuccess()
				setOpen(false)
			} else {
				toast.error(result.message || "Error al marcar documentos para actualización")
			}
		} catch (error) {
			console.error("Error updating document status:", error)
			toast.error("Error al marcar documentos para actualización")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size={"icon"} variant="outline" className="size-8">
					<FileSymlinkIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Marcar Documentos para Actualización</DialogTitle>
					<DialogDescription asChild>
						<div>
							¿Estás seguro(a) de que deseas marcar estos documentos para actualización? Los
							documentos cambiarán al estado de{" "}
							<span className="font-semibold">&quot;A actualizar&quot;</span>.
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
						className="bg-blue-600 transition-all hover:scale-105 hover:bg-blue-700 hover:text-white"
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Marcando..." : "Marcar para actualización"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
