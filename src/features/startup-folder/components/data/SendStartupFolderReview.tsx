"use client"

import { ClipboardCheckIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { sendFolderReview } from "@/features/startup-folder/actions/send-folder-review"
import { DocumentCategory } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"

import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

interface SendStartupFolderReviewProps {
	title: string
	userId: string
	folderId: string
	companyId: string
	category: DocumentCategory
}

export function SendStartupFolderReview({
	title,
	userId,
	folderId,
	category,
	companyId,
}: SendStartupFolderReviewProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

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
				throw new Error("Error al procesar la revisión de la carpeta")
			}

			// Mostrar mensaje de éxito
			toast("Carpeta enviada para revisión", {
				description: "La empresa contratista ha sido notificada sobre la aprobación",
			})

			queryClient.invalidateQueries({
				queryKey: ["startupFolder", { companyId }],
			})

			setIsOpen(false)
		} catch (error) {
			console.error(error)
			toast.error("Ocurrió un error al procesar la revisión")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					disabled={isSubmitting}
					className="hover:bg-primary/80 flex-col gap-0.5 py-9 font-normal"
				>
					<ClipboardCheckIcon className="size-5" />
					Enviar revisión
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Enviar revisión</DialogTitle>
					<DialogDescription>
						Esto enviará la revisión de la carpeta <strong>{title}</strong> a la empresa contratista
						para que pueda modificar los documentos si es necesario.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="flex justify-end pt-4">
					<DialogClose>
						<Button variant={"secondary"}>Cancelar</Button>
					</DialogClose>
					<Button
						type="submit"
						onClick={onSubmit}
						disabled={isSubmitting}
						className="bg-primary hover:bg-primary/80"
					>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Enviar revisión
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
