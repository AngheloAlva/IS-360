"use client"

import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { deleteStartupFolder } from "@/project/startup-folder/actions/deleteStartupFolder"

import { Button } from "@/shared/components/ui/button"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogTrigger,
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"

interface DeleteStartupFolderDialogProps {
	userId: string
	folderId: string
	folderName: string
	onSuccess?: () => void
}

export default function DeleteStartupFolderDialog({
	userId,
	folderId,
	onSuccess,
	folderName,
}: DeleteStartupFolderDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	const handleDelete = async () => {
		setIsDeleting(true)

		try {
			const result = await deleteStartupFolder({
				startupFolderId: folderId,
				userId,
			})

			if (result.ok) {
				toast.success(result.message)
				setIsOpen(false)
				onSuccess?.()
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error("Error al eliminar carpeta:", error)
			toast.error("Error inesperado al eliminar la carpeta de arranque")
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button
					size="lg"
					variant="outline"
					className="bg-background gap-2 border-red-500/20 text-red-500 hover:bg-red-700 hover:text-white"
				>
					<Trash2Icon />
					Eliminar
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Estás seguro de eliminar esta carpeta?</AlertDialogTitle>
					<AlertDialogDescription className="space-y-2">
						<p>
							Estás a punto de eliminar la carpeta de arranque:{" "}
							<span className="text-foreground font-semibold">{folderName}</span>
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isDeleting}
						className="bg-red-600 hover:bg-red-700"
					>
						{isDeleting ? "Eliminando..." : "Sí, eliminar carpeta"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
