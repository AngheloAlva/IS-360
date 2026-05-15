"use client"

import { ArchiveIcon, ArchiveRestoreIcon, Loader2Icon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { archiveStartupFolder } from "../../actions/archiveStartupFolder"

import { Button } from "@/shared/components/ui/button"
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

interface ArchiveStartupFolderDialogProps {
	startupFolderId: string
	folderName: string
	isArchived: boolean
	trigger?: React.ReactNode
}

export function ArchiveStartupFolderDialog({
	startupFolderId,
	folderName,
	isArchived,
	trigger,
}: ArchiveStartupFolderDialogProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const queryClient = useQueryClient()

	const handleArchive = async () => {
		setIsLoading(true)

		const result = await archiveStartupFolder({
			startupFolderId,
			archive: !isArchived,
		})

		setIsLoading(false)

		if (result.ok) {
			toast.success(result.message)
   void queryClient.invalidateQueries({ queryKey: ["startupFolders"] })
			setIsOpen(false)
		} else {
			toast.error(result.message)
		}
	}

	const Icon = isArchived ? ArchiveRestoreIcon : ArchiveIcon
	const actionText = isArchived ? "Desarchivar" : "Archivar"

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				{trigger || (
					<Button
						size="lg"
						variant="outline"
						className="bg-background border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-white"
					>
						<Icon className="h-4 w-4" />
						{actionText}
					</Button>
				)}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isArchived ? "¿Desarchivar carpeta?" : "¿Archivar carpeta?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isArchived ? (
							<>
								La carpeta <strong>{folderName}</strong> será restaurada y volverá a ser visible
								para los contratistas y administradores.
							</>
						) : (
							<>
								La carpeta <strong>{folderName}</strong> será archivada y ocultada de la vista
								principal. Los contratistas no podrán verla, pero seguirá disponible en la sección
								de carpetas archivadas para mantener la trazabilidad.
							</>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
					<AlertDialogAction onClick={handleArchive} disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
								{isArchived ? "Desarchivando..." : "Archivando..."}
							</>
						) : (
							<>
								<Icon className="mr-2 h-4 w-4" />
								{actionText}
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
