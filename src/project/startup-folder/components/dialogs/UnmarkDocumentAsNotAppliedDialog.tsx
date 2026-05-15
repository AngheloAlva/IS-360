"use client"

import { useState } from "react"
import { toast } from "sonner"
import { LoaderIcon, RotateCcwIcon } from "lucide-react"

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

interface UnmarkDocumentAsNotAppliedDialogProps {
	documentName: string
	onSuccess: () => void
	onUnmarkAsNotApplied: () => Promise<{ ok: boolean; message?: string }>
}

export function UnmarkDocumentAsNotAppliedDialog({
	onSuccess,
	documentName,
	onUnmarkAsNotApplied,
}: UnmarkDocumentAsNotAppliedDialogProps) {
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const handleConfirm = async () => {
		setIsLoading(true)
		try {
			const result = await onUnmarkAsNotApplied()

			if (result.ok) {
				toast.success(result.message || "Documento revertido a 'No subido' exitosamente")
				setOpen(false)
				onSuccess()
			} else {
				toast.error(result.message || "Error al revertir documento en 'No Aplica'")
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
				<Button size="icon" variant="ghost" className="text-amber-600 hover:text-amber-700">
					<RotateCcwIcon className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Revertir estado &quot;No Aplica&quot;</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className="space-y-2">
							<p>
								¿Está seguro que desea revertir el documento <strong>{documentName}</strong>?
								Volverá a estado &quot;No subido&quot; y deberá cargarse nuevamente si aplica.
							</p>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>

					<AlertDialogAction
						disabled={isLoading}
						onClick={handleConfirm}
						className="cursor-pointer bg-amber-600 transition-all hover:scale-105 hover:bg-amber-700 hover:text-white"
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
