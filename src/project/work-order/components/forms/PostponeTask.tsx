import { ClockFadingIcon } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { postponeTask } from "@/project/maintenance-plan/actions/postponeTask"
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

export default function PostponeTaskDialog({
	taskId,
	nextDate,
}: {
	taskId: string
	nextDate: Date
}) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handlePostponeTask = async () => {
		setIsLoading(true)

		try {
			const res = await postponeTask({ id: taskId })

			if (res.ok) {
				queryClient.invalidateQueries({
					queryKey: ["maintenance-plan-tasks"],
				})
				toast.success("Se ha pospuesto la tarea correctamente")
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al posponer la tarea")
		} finally {
			setOpen(false)
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger className="hover:bg-accent text-text hover:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:hover:bg-destructive/10 dark:data-[variant=destructive]:hover:bg-destructive/40 data-[variant=destructive]:hover:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex h-fit w-full cursor-default items-center gap-2 rounded-sm bg-transparent px-2 py-1.5 text-sm outline-hidden select-none hover:scale-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
				<ClockFadingIcon />
				Posponer
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Posponer tarea</AlertDialogTitle>
					<AlertDialogDescription>
						<span className="mb-2 font-semibold">¿Estás seguro de querer posponer esta tarea?</span>
						<br />
						Esto cambiará la siguiente fecha de ejecución de la tarea:{" "}
						{format(new Date(nextDate), "dd-MM-yyyy")}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
							handlePostponeTask()
						}}
						className="bg-purple-600 transition-all hover:scale-105 hover:bg-purple-700"
					>
						{isLoading ? <Spinner className="h-4 w-4" /> : "Posponer"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
