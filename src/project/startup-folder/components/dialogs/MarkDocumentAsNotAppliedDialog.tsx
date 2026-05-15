"use client"

import { useState } from "react"
import { toast } from "sonner"
import { XCircleIcon, LoaderIcon } from "lucide-react"

import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogTrigger,
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"

interface MarkDocumentAsNotAppliedDialogProps {
	documentName: string
	onSuccess: () => void
	onMarkAsNotApplied: () => Promise<{ ok: boolean; message?: string }>
}

export function MarkDocumentAsNotAppliedDialog({
	onSuccess,
	documentName,
	onMarkAsNotApplied,
}: MarkDocumentAsNotAppliedDialogProps) {
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const handleConfirm = async () => {
		setIsLoading(true)
		try {
			const result = await onMarkAsNotApplied()

			if (result.ok) {
				toast.success(result.message || "Documento marcado como 'No Aplica' exitosamente")
				setOpen(false)
				onSuccess()
			} else {
				toast.error(result.message || "Error al marcar documento como 'No Aplica'")
			}
		} catch (error) {
			console.error("Error:", error)
			toast.error("Error al procesar la solicitud")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button size="icon" variant="ghost" className="text-slate-500 hover:text-slate-700">
					<XCircleIcon className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Marcar documento como &quot;No Aplica&quot;</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className="space-y-2">
							<p>
								¿Está seguro que desea marcar el documento <strong>{documentName}</strong> como
								&quot;No Aplica&quot;? Esto hará que no sea necesario subir el documento.
							</p>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>

					<AlertDialogAction
						disabled={isLoading}
						onClick={handleConfirm}
						className="cursor-pointer bg-slate-600 transition-all hover:scale-105 hover:bg-slate-700 hover:text-white"
					>
						{isLoading ? (
							<>
								<LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
								Procesando...
							</>
						) : (
							"Confirmar"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
