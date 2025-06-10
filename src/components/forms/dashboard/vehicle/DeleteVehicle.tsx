import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { deleteVehicle } from "@/actions/vehicles/deleteVehicle"
import { queryClient } from "@/lib/queryClient"

import Spinner from "@/components/shared/Spinner"
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
} from "@/components/ui/alert-dialog"

export default function DeleteVehicleDialog({
	vehicleId,
	companyId,
}: {
	vehicleId: string
	companyId: string
}) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleDeleteVehicle = async () => {
		setIsLoading(true)

		try {
			const res = await deleteVehicle({ vehicleId, companyId })

			if (res.ok) {
				queryClient.invalidateQueries({
					queryKey: ["vehicles"],
				})
				toast.success("Se ha eliminado el vehículo correctamente")
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al eliminar el vehículo")
		} finally {
			setOpen(false)
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger className="flex items-center gap-2">
				<Trash2Icon className="size-4" />
				Eliminar vehículo
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Eliminar vehículo</AlertDialogTitle>
					<AlertDialogDescription>
						¿Estás seguro de querer eliminar este vehículo?
						<br />
						Recuerda que una vez eliminado, no podrás modificar el vehículo.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
							handleDeleteVehicle()
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
