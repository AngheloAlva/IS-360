import { useState } from "react"
import { toast } from "sonner"

import {
	approveMilestone,
	rejectMilestone,
} from "@/project/work-order/actions/milestone/approve-milestone"

import { Textarea } from "@/shared/components/ui/textarea"
import Spinner from "@/shared/components/Spinner"
import { Label } from "@/shared/components/ui/label"
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

export default function CloseMilestoneDialog({
	userId,
	milestoneId,
}: {
	userId: string
	milestoneId: string
}) {
	const [closureComment, setClosureComment] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleApproveMilestone = async () => {
		setIsLoading(true)

		try {
			const res = await approveMilestone({
				userId,
				milestoneId,
				closureComment,
			})

			if (res.ok) {
				toast.success("Se ha aprobado el cierre del hito correctamente")
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al aprobar el cierre del hito")
		} finally {
			setOpen(false)
			setIsLoading(false)
		}
	}

	const handleRejectMilestone = async () => {
		setIsLoading(true)

		try {
			const res = await rejectMilestone({
				userId,
				milestoneId,
				closureComment,
			})

			if (res.ok) {
				toast.success("Se ha rechazado el cierre del hito correctamente")
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al rechazar el cierre del hito")
		} finally {
			setOpen(false)
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger className="mt-auto w-full rounded-md bg-indigo-500 px-2 py-2 text-white hover:bg-indigo-600">
				Aprobar o rechazar
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Solicitar cierre</AlertDialogTitle>
					<AlertDialogDescription>Aprueba o rechaza el cierre del hito.</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label>Comentario</Label>
						<Textarea
							className="h-24"
							value={closureComment}
							onChange={(e) => setClosureComment(e.target.value)}
						/>
					</div>
				</div>

				<AlertDialogFooter className="mt-4">
					<AlertDialogCancel className="mr-auto">Cancelar</AlertDialogCancel>

					<AlertDialogAction
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
							handleRejectMilestone()
						}}
						className="bg-red-500 hover:bg-red-500/80 hover:text-white"
					>
						{isLoading ? <Spinner className="h-4 w-4" /> : "Rechazar"}
					</AlertDialogAction>

					<AlertDialogAction
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
							handleApproveMilestone()
						}}
						className="hover:bg-primary/80 hover:text-white"
					>
						{isLoading ? <Spinner className="h-4 w-4" /> : "Aprobar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
