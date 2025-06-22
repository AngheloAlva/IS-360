"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
	deleteFile,
	deleteFolder,
	getDeletePreview,
} from "@/project/document/actions/deleteFileOrFolder"

import { Skeleton } from "@/shared/components/ui/skeleton"
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
} from "@/shared/components/ui/alert-dialog"

interface DeleteConfirmationDialogProps {
	id: string
	name: string
	type: "file" | "folder"
}

export default function DeleteConfirmationDialog({
	id,
	type,
	name,
}: DeleteConfirmationDialogProps) {
	const router = useRouter()

	const [isPreviewLoading, setIsPreviewLoading] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [preview, setPreview] = useState<{
		files: Array<{ id: string; name: string }>
		folders: Array<{ id: string; name: string }>
	} | null>(null)
	const [isOpen, setIsOpen] = useState(false)

	const handlePreview = async () => {
		try {
			setIsPreviewLoading(true)
			const previewData = await getDeletePreview(id, type)
			setPreview(previewData)
			setIsOpen(true)
		} catch (error) {
			console.log(error)
			toast.error("Error al obtener la vista previa de eliminación")
		} finally {
			setIsPreviewLoading(false)
		}
	}

	const handleDelete = async () => {
		setIsLoading(true)
		try {
			const response = type === "file" ? await deleteFile(id) : await deleteFolder(id)

			if (response.success) {
				toast.success(response.message)
				router.refresh()
			} else {
				toast.error(response.message)
			}
		} catch (error) {
			console.log(error)
			toast.error("Error al eliminar el elemento")
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
					variant="outline"
					onClick={handlePreview}
					className="border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						¿Estás seguro que deseas eliminar {type === "file" ? "el archivo" : "la carpeta"} &quot;
						{name}&quot;?
					</AlertDialogTitle>

					<div className="space-y-2">
						{isPreviewLoading ? (
							<Skeleton className="h-32 w-full" />
						) : (
							preview && (
								<>
									<span>Se marcarán como eliminados los siguientes elementos:</span>
									{preview.folders.length > 0 && (
										<div>
											<span className="font-medium">Carpetas ({preview.folders.length}):</span>
											<ul className="list-disc pl-6">
												{preview.folders.map((folder) => (
													<li key={folder.id}>{folder.name}</li>
												))}
											</ul>
										</div>
									)}
									{preview.files.length > 0 && (
										<div>
											<span className="font-medium">Archivos ({preview.files.length}):</span>
											<ul className="list-disc pl-6">
												{preview.files.map((file) => (
													<li key={file.id}>{file.name}</li>
												))}
											</ul>
										</div>
									)}
									<p className="text-muted-foreground mt-4 text-sm">
										Esta acción no eliminará permanentemente los elementos, pero ya no serán
										listados.
									</p>
								</>
							)
						)}
					</div>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isLoading || isPreviewLoading}
						className="bg-destructive hover:bg-destructive/90"
					>
						{isLoading ? "Eliminando..." : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
