import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { deletePlanTask } from "../../actions/deletePlanTask"
import { queryClient } from "@/lib/queryClient"

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

export default function DeletePlanTaskDialog({
	taskId,
	maintenancePlanSlug,
}: {
	taskId: string
	maintenancePlanSlug: string
}) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleDeletePlanTask = async () => {
		setIsLoading(true)

		try {
			const res = await deletePlanTask(taskId)

			if (res.ok) {
				queryClient.invalidateQueries({
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
			<AlertDialogTrigger className="hover:bg-accent text-text hover:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:hover:bg-destructive/10 dark:data-[variant=destructive]:hover:bg-destructive/40 data-[variant=destructive]:hover:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex h-fit w-full cursor-default items-center gap-2 rounded-sm bg-transparent px-2 py-1.5 text-sm outline-hidden select-none hover:scale-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
				<Trash2Icon className="size-4" />
				Eliminar
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
							handleDeletePlanTask()
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
