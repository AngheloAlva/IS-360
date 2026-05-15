import { CircleCheckIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { reactiveCompany } from "../../actions/reactiveCompany"
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

export default function ReactiveCompanyDialog({ companyId }: { companyId: string }) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleReactiveCompany = async () => {
		setIsLoading(true)

		try {
			const res = await reactiveCompany(companyId)

			if (res.ok) {
    void queryClient.invalidateQueries({
					queryKey: ["companies"],
				})
				toast.success("Se ha eliminado la empresa correctamente")
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al eliminar la empresa")
		} finally {
			setOpen(false)
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger className="flex cursor-pointer items-center justify-start gap-1.5 px-1 transition-all">
				<CircleCheckIcon className="size-4 text-green-500" />
				Reactivar
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Reactivar empresa</AlertDialogTitle>
					<AlertDialogDescription>
						¿Estás seguro de querer reactivar esta empresa?
						<br />
						Recuerda que una vez reactivada, esto hará que la empresa pueda ser utilizada de nuevo
						en la plataforma.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
       void handleReactiveCompany()
						}}
						className="bg-green-600 transition-all hover:scale-105 hover:bg-green-700"
					>
						{isLoading ? <Spinner className="h-4 w-4" /> : "Reactivar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
