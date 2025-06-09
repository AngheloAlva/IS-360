import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { deleteUser } from "@/actions/users/deleteUser"
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

export default function DeleteUserDialog({ userId }: { userId: string }) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleDeleteUser = async () => {
		setIsLoading(true)

		try {
			const res = await deleteUser(userId)

			if (res.ok) {
				queryClient.invalidateQueries({
					queryKey: ["users", { showOnlyInternal: true }],
				})
				toast.success("Se ha eliminado el usuario correctamente")
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al eliminar el usuario")
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
					<AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
					<AlertDialogDescription>
						¿Estás seguro de querer eliminar este usuario?
						<br />
						Recuerda que una vez eliminado, no podrás modificar el usuario.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isLoading}
						onClick={(e) => {
							e.preventDefault()
							handleDeleteUser()
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
