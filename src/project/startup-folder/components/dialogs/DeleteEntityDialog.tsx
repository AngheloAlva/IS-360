"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
	deleteBasicFolder,
	deleteWorkerFolder,
	deleteVehicleFolder,
} from "@/project/startup-folder/actions/documents/delete-entities"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"

interface DeleteEntityDialogProps {
	entityId: string
	folderId: string
	entityName: string
	entityCategory: "WORKER" | "VEHICLE" | "BASIC"
	onSuccess: () => void
}

export default function DeleteEntityDialog({
	entityId,
	folderId,
	onSuccess,
	entityName,
	entityCategory,
}: DeleteEntityDialogProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	const handleDelete = async () => {
		setIsLoading(true)

		try {
			let response

			if (entityCategory === "WORKER") {
				response = await deleteWorkerFolder({
					folderId,
					workerId: entityId,
				})
			} else if (entityCategory === "VEHICLE") {
				response = await deleteVehicleFolder({
					folderId,
					vehicleId: entityId,
				})
			} else if (entityCategory === "BASIC") {
				response = await deleteBasicFolder({
					folderId,
					workerId: entityId,
				})
			}

			if (response?.ok) {
				toast.success(response.message)
				onSuccess()
			} else {
				toast.error(response?.message)
			}
		} catch (error) {
			console.log(error)
			toast.error("Error al eliminar la carpeta")
		} finally {
			setIsLoading(false)
			setIsOpen(false)
		}
	}

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button
					type="button"
					size={"icon"}
					variant="ghost"
					className="z-50 size-8 text-red-500 hover:bg-red-500 hover:text-white"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						¿Estás seguro que deseas eliminar la carpeta de {entityName}?
					</AlertDialogTitle>

					<div className="space-y-2">
						<p className="text-muted-foreground mt-4 text-sm">
							Esta acción eliminará permanentemente la carpeta de {entityName} y todos los
							documentos asociados. NO se podrá revertir esta acción.
						</p>
					</div>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isLoading}
						onClick={handleDelete}
						className="bg-destructive hover:bg-destructive/90"
					>
						{isLoading ? <Spinner /> : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
