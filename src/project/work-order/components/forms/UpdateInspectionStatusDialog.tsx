import { useState } from "react"
import { toast } from "sonner"

import { updateInspectionStatus } from "@/project/work-order/actions/updateInspectionStatus"
import { INSPECTION_STATUS } from "@prisma/client"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"

export default function UpdateInspectionStatusDialog({
	userId,
	workEntryId,
	currentStatus,
	onStatusUpdate,
}: {
	userId: string
	workEntryId: string
	currentStatus: INSPECTION_STATUS
	onStatusUpdate?: () => void
}) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const newStatus: INSPECTION_STATUS = currentStatus === "REPORTED" ? "RESOLVED" : "REPORTED"
	const actionText = newStatus === "RESOLVED" ? "Marcar como resuelta" : "Marcar como reportada"
	const confirmText = newStatus === "RESOLVED" ? "Resolver" : "Reportar"

	const handleUpdateStatus = async () => {
		setIsLoading(true)

		try {
			const res = await updateInspectionStatus({
				userId,
				workEntryId,
				status: newStatus,
			})

			if (res.ok) {
				toast.success(res.message)
				onStatusUpdate?.()
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al actualizar el estado de la inspección")
		} finally {
			setOpen(false)
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button
					size="sm"
					className={
						newStatus === "RESOLVED"
							? "bg-teal-500 text-white hover:bg-teal-600"
							: "bg-amber-500 text-white hover:bg-amber-600"
					}
				>
					{actionText}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Cambiar estado de inspección</AlertDialogTitle>
					<AlertDialogDescription>
						¿Estás seguro de que deseas marcar esta inspección como{" "}
						{newStatus === "RESOLVED" ? "resuelta" : "reportada"}?
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
							handleUpdateStatus()
						}}
						className={
							newStatus === "RESOLVED"
								? "bg-teal-500 hover:bg-teal-600 hover:text-white"
								: "bg-amber-500 hover:bg-amber-600 hover:text-white"
						}
					>
						{isLoading ? <Spinner className="h-4 w-4" /> : confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
