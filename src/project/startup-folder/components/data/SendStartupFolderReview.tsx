"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { sendFolderReview } from "@/project/startup-folder/actions/send-folder-review"
import { DocumentCategory } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"

import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

interface SendStartupFolderReviewProps {
	title: string
	userId: string
	isOpen: boolean
	folderId: string
	companyId: string
	onClose: () => void
	onSuccess: () => void
	category: DocumentCategory
}

export function SendStartupFolderReview({
	title,
	userId,
	isOpen,
	onClose,
	category,
	folderId,
	companyId,
	onSuccess,
}: SendStartupFolderReviewProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()

		setIsSubmitting(true)

		try {
			const response = await sendFolderReview({
				userId,
				category,
				folderId,
			})

			if (!response.ok) {
				throw new Error("Error al procesar la notificación de la revisión")
			}

			// Mostrar mensaje de éxito
			toast("Notificación de revisión enviada", {
				description: "La empresa contratista ha sido notificada sobre la revisión",
			})

			queryClient.invalidateQueries({
				queryKey: ["startupFolder", { companyId }],
			})

			onClose()
			onSuccess()
		} catch (error) {
			console.error(error)
			toast.error("Ocurrió un error al procesar la notificación de la revisión")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Notificar revisión</DialogTitle>
					<DialogDescription className="flex flex-col gap-3">
						<span>
							Esto enviará la notificación de la revisión de la carpeta <strong>{title}</strong> a
							la empresa contratista para que pueda modificar los documentos si es necesario.
						</span>

						<span>
							Esto pondra todos los documentos no revisados en estado de &quot;Borrador&quot;.
						</span>
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="flex justify-end pt-4">
					<DialogClose>
						<Button type="button" variant={"outline"}>
							Cancelar
						</Button>
					</DialogClose>
					<Button
						type="submit"
						onClick={onSubmit}
						disabled={isSubmitting}
						className="bg-emerald-600 transition-all hover:scale-105 hover:bg-emerald-700 hover:text-white"
					>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Notificar revisión
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
