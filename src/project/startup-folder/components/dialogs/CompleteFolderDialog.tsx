"use client"

import { CheckIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { completeFolder } from "../../actions/complete-folder"

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
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"

interface CompleteFolderDialogProps {
	folderId: string
	onSuccess: () => void
}

export default function CompleteFolderDialog({ folderId, onSuccess }: CompleteFolderDialogProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	const handleCompleteFolder = async () => {
		setIsLoading(true)

		const { ok, message } = await completeFolder({ startupFolderId: folderId })

		if (!ok) {
			toast.error(message)
			return
		}

		toast.success("Carpeta completada exitosamente")
		setIsLoading(false)
		setIsOpen(false)

		onSuccess()
	}
	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button className="bg-cyan-600 text-white transition-all hover:scale-105 hover:bg-cyan-700 hover:text-white">
					<CheckIcon className="h-4 w-4" />
					Marcar como completada
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						¿Estás seguro(a) que deseas marcar la carpeta como completada?
					</AlertDialogTitle>

					<AlertDialogDescription className="text-muted-foreground text-sm">
						Esta acción completará la carpeta de arranque y notificará a todos los supervisores de
						la empresa.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>

					<AlertDialogAction asChild>
						<Button
							disabled={isLoading}
							onClick={handleCompleteFolder}
							className="bg-cyan-600 hover:bg-cyan-700 hover:text-white"
						>
							{isLoading ? <Spinner /> : "Marcar como completada"}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
