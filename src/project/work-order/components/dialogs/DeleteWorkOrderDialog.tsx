"use client"

import { TrashIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { deleteWorkOrder } from "@/project/work-order/actions/deleteWorkOrder"
import { queryClient } from "@/lib/queryClient"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import Spinner from "@/shared/components/Spinner"

interface DeleteWorkOrderDialogProps {
	otNumber: string
	workOrderId: string
}

export default function DeleteWorkOrderDialog({
	otNumber,
	workOrderId,
}: DeleteWorkOrderDialogProps): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)

	async function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault()
		setLoading(true)

		try {
			const { ok, message } = await deleteWorkOrder({ workOrderId })

			if (ok) {
				toast.success(message)
				setOpen(false)
				void queryClient.invalidateQueries({ queryKey: ["workOrders"] })
			} else {
				toast.error(message)
			}
		} catch (error) {
			console.error("[DELETE_WORK_ORDER]", error)
			toast.error("Error al eliminar la orden de trabajo")
		} finally {
			setLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
				onClick={(event) => event.stopPropagation()}
			>
				<TrashIcon className="size-4" />
				Eliminar
			</AlertDialogTrigger>

			<AlertDialogContent onClick={(event) => event.stopPropagation()}>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Eliminar orden de trabajo {otNumber}?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta accion solo se permite cuando la OT esta en estado Planificada o Pendiente y no
						tiene hitos, actividades diarias ni inspecciones internas. La OT se ocultara de las vistas
						pero quedara registrada para auditoria.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={loading}
						onClick={handleDelete}
						className="bg-red-600 hover:bg-red-700"
					>
						{loading ? <Spinner /> : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
