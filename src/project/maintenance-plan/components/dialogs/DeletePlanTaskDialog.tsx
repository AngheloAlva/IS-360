import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { deletePlanTask } from "../../actions/deletePlanTask"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

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
import { Button } from "@/shared/components/ui/button"

export default function DeletePlanTaskDialog({
	taskId,
	maintenancePlanSlug,
	triggerClassName,
	triggerLabel,
}: {
	taskId: string
	maintenancePlanSlug: string
	triggerClassName?: string
	triggerLabel?: string
}) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleDeletePlanTask = async () => {
		setIsLoading(true)

		try {
			const res = await deletePlanTask(taskId)

			if (res.ok) {
    void queryClient.invalidateQueries({
					queryKey: ["maintenance-plans-tasks", { planSlug: maintenancePlanSlug }],
				})
				toast.success("Se ha eliminado la tarea correctamente")
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al eliminar la tarea")
		} finally {
			setOpen(false)
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button
					size={"sm"}
					variant={"destructive"}
					className={cn("border border-red-500", triggerClassName)}
				>
					<Trash2Icon />
					{triggerLabel ?? "Eliminar"}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Eliminar Tarea</AlertDialogTitle>
					<AlertDialogDescription>
						¿Estás seguro de querer ELIMINAR esta tarea DEFINITIVAMENTE?
						<br />
						Recuerda que una vez eliminada la tarea, no podrás volver a reactivarla.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
       void handleDeletePlanTask()
						}}
						className="bg-rose-600 transition-all hover:scale-105 hover:bg-rose-700"
					>
						{isLoading ? <Spinner className="h-4 w-4" /> : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
