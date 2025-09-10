import { RefreshCwIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { reactivateUser } from "@/project/user/actions/reactivateUser"
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

export default function ReactivateExternalUserDialog({
	userId,
	companyId,
}: {
	userId: string
	companyId: string
}) {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleDeleteUser = async () => {
		setIsLoading(true)

		try {
			const res = await reactivateUser(userId)

			if (res.ok) {
				queryClient.invalidateQueries({
					queryKey: ["usersByCompany", { companyId }],
				})
				toast.success("Se ha eliminado el colaborador correctamente")
			} else {
				toast.error(res.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al eliminar el colaborador")
		} finally {
			setOpen(false)
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger className="hover:bg-accent hover:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
				<RefreshCwIcon />
				Reactivar Colaborador
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Reactivar Colaborador</AlertDialogTitle>
					<AlertDialogDescription>
						¿Estás seguro de querer reactivar este colaborador?
						<br />
						Una vez reactivado, el colaborador podrá volver a iniciar sesión.
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
						className="bg-green-600 transition-all hover:scale-105 hover:bg-green-700"
					>
						{isLoading ? <Spinner className="h-4 w-4" /> : "Reactivar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
