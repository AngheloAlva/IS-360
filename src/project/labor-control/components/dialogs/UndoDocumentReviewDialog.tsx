"use client"

import { Undo2Icon } from "lucide-react"
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

interface UndoDocumentReviewDialogProps {
	userId: string
	workerId?: string
	documents: Array<{
		id: string
		name: string
	}>
	onSuccess: () => void
}

export function UndoDocumentReviewDialog({
	userId,
	workerId,
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

			if (workerId) {
				const { undoDocumentReview } = await import(
					"@/project/labor-control/actions/worker/update-worker-document-status"
				)
				result = await undoDocumentReview({
					userId,
					documentIds,
				})
			} else {
				const { updateLaborControlDocumentStatus } = await import(
					"@/project/labor-control/actions/update-labor-control-document-status"
				)
				result = await updateLaborControlDocumentStatus({
					userId,
					documentIds,
				})
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
