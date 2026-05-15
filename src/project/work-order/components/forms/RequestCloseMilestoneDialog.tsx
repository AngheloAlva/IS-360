import { useState } from "react"
import { toast } from "sonner"

import { requestCloseMilestone } from "@/project/work-order/actions/milestone/close-milestone"

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
import { queryClient } from "@/lib/queryClient"

export default function RequestCloseMilestoneDialog({
	workOrderId,
	milestoneId,
	tutorialMode = false,
	onTutorialConfirm,
	triggerDataTutorialId,
	contentDataTutorialId,
	confirmDataTutorialId,
}: {
	workOrderId: string
	milestoneId: string
	tutorialMode?: boolean
	onTutorialConfirm?: () => void
	triggerDataTutorialId?: string
	contentDataTutorialId?: string
	confirmDataTutorialId?: string
}) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleRequestCloseMilestone = async () => {
		if (tutorialMode) {
			onTutorialConfirm?.()
			setOpen(false)
			toast.success("Hito enviado a aprobacion (simulacion)")
			return
		}

		setIsLoading(true)

		try {
			const res = await requestCloseMilestone({
				milestoneId,
			})

			if (res.ok) {
    void queryClient.invalidateQueries({
					queryKey: ["workBookMilestones", { workOrderId, showAll: true }],
				})
				toast.success("Se ha solicitado el cierre del hito correctamente")
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al solicitar el cierre del hito")
		} finally {
			setOpen(false)
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				data-tutorial-id={triggerDataTutorialId}
				className="mt-auto w-full rounded-md bg-orange-600 px-2 py-2 text-white transition-all hover:scale-105 hover:bg-orange-700"
			>
				Solicitar cierre
			</AlertDialogTrigger>
			<AlertDialogContent data-tutorial-id={contentDataTutorialId}>
				<AlertDialogHeader>
					<AlertDialogTitle>Solicitar cierre</AlertDialogTitle>
					<AlertDialogDescription>
						¿Estás seguro de querer solicitar el cierre de este hito?
						<br />
						Recuerda que una vez cerrado, no podrás modificar el hito y tendrás que esperar a que el
						responsable lo apruebe.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						data-tutorial-id={confirmDataTutorialId}
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
       void handleRequestCloseMilestone()
						}}
						className="bg-orange-600 transition-all hover:scale-105 hover:bg-orange-700 hover:text-white"
					>
						{isLoading ? <Spinner className="h-4 w-4" /> : "Solicitar cierre"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
