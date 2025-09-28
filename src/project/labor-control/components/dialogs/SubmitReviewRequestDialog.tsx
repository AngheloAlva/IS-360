"use client"

import { SendIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogFooter,
	DialogContent,
	DialogTrigger,
	DialogDescription,
} from "@/shared/components/ui/dialog"

interface SubmitReviewRequestDialogProps {
	userId: string
	folderId: string
	workerId?: string
	onSuccess: () => void
}

export function SubmitReviewRequestDialog({
	userId,
	folderId,
	workerId,
	onSuccess,
}: SubmitReviewRequestDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [open, setOpen] = useState<boolean>(false)

	const onSubmit = async () => {
		setIsSubmitting(true)

		try {
			let result: { ok: boolean; message?: string }

			if (workerId) {
				const { submitWorkerFolderForReview } = await import(
					"@/project/labor-control/actions/worker/submit-worker-folder-for-review"
				)
				result = await submitWorkerFolderForReview({
					userId,
					folderId,
				})
			} else {
				const { submitLaborControlFolderForReview } = await import(
					"@/project/labor-control/actions/submit-labor-control-folder-for-review"
				)
				result = await submitLaborControlFolderForReview({
					userId,
					folderId,
				})
			}

			if (result.ok) {
				setOpen(false)
				onSuccess()
			} else {
				toast.error(result.message || "Error al enviar la solicitud.")
			}
		} catch (error) {
			console.error("Error submitting review request:", error)
			toast.error("Error al enviar la solicitud.")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="ml-4 gap-2 bg-cyan-500 text-white transition-all hover:scale-105 hover:bg-cyan-600 hover:text-white">
					<SendIcon className="h-4 w-4" />
					Enviar a revisión
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Enviar documentos a revisión</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas enviar estos documentos a revisión? Los documentos no podrán
						ser modificados hasta que sean aprobados o rechazados.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						disabled={isSubmitting}
						onClick={() => setOpen(false)}
					>
						Cancelar
					</Button>

					<Button
						onClick={onSubmit}
						disabled={isSubmitting}
						className="bg-cyan-500 transition-all hover:scale-105 hover:bg-cyan-600 hover:text-white"
					>
						{isSubmitting ? "Enviando..." : "Enviar a revisión"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
