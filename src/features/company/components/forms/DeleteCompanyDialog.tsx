import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { deleteCompany } from "@/features/company/actions/deleteCompany"
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

export default function DeleteCompanyDialog({ companyId }: { companyId: string }) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleDeleteCompany = async () => {
		setIsLoading(true)

		try {
			const res = await deleteCompany(companyId)

			if (res.ok) {
				queryClient.invalidateQueries({
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
			<AlertDialogTrigger className="flex size-8 items-center justify-center rounded-md bg-rose-500 text-white transition-all hover:scale-105 hover:bg-rose-600 hover:text-white">
				<Trash2Icon className="size-4" />
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Eliminar empresa</AlertDialogTitle>
					<AlertDialogDescription>
						¿Estás seguro de querer eliminar esta empresa?
						<br />
						Recuerda que una vez eliminada, no podrás modificar la empresa.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
							handleDeleteCompany()
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
