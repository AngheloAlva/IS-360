"use client"

import {
	EditIcon,
	PlusIcon,
	TrashIcon,
	Loader2Icon,
	DownloadIcon,
	FileTextIcon,
	ExternalLinkIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { openDocumentSecurely, extractFilenameFromUrl } from "@/lib/view-document"
import {
	useGuideDocuments,
	useDeleteGuideDocument,
	type GuideDocument,
} from "../../hooks/use-guide-documents"

import { GuideDocumentForm } from "../forms/GuideDocumentForm"
import { Button } from "@/shared/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"

import type { StartupFolderType } from "@/generated/prisma/enums"

interface GuideDocumentsDropdownProps {
	isAdmin?: boolean
	hasPermission?: boolean
	folderType?: StartupFolderType
}

export function GuideDocumentsDropdown({
	isAdmin = false,
	folderType = "FULL",
	hasPermission = false,
}: GuideDocumentsDropdownProps) {
	const { data: documents, isLoading } = useGuideDocuments({
		visibility: folderType,
	})
	const deleteMutation = useDeleteGuideDocument()

	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [selectedDocument, setSelectedDocument] = useState<GuideDocument | null>(null)
	const [loadingDocId, setLoadingDocId] = useState<string | null>(null)

	const handleOpenDocument = async (url: string, docId: string) => {
		const filename = extractFilenameFromUrl(url)

		if (!filename) {
			toast.error("No se pudo obtener el nombre del archivo")
			return
		}

		setLoadingDocId(docId)
		try {
			await openDocumentSecurely(filename, "documents")
		} catch (error) {
			console.error("Error opening document:", error)
			toast.error("Error al abrir el documento")
		} finally {
			setLoadingDocId(null)
		}
	}

	const handleEdit = (doc: GuideDocument, e: React.MouseEvent) => {
		e.stopPropagation()
		setSelectedDocument(doc)
		setIsEditOpen(true)
	}

	const handleDeleteClick = (doc: GuideDocument, e: React.MouseEvent) => {
		e.stopPropagation()
		setSelectedDocument(doc)
		setIsDeleteOpen(true)
	}

	const handleConfirmDelete = async () => {
		if (!selectedDocument) return

		try {
			const result = await deleteMutation.mutateAsync(selectedDocument.id)
			if (result.ok) {
				toast.success(result.message)
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error("Error deleting document:", error)
			toast.error("Error al eliminar el documento")
		} finally {
			setIsDeleteOpen(false)
			setSelectedDocument(null)
		}
	}

	const canManage = isAdmin && hasPermission

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						size={"lg"}
						className="gap-0 bg-white text-teal-600 transition-all hover:scale-105 hover:bg-white hover:text-teal-600"
					>
						<DownloadIcon className="mr-2 h-4 w-4" />
						Documentos
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-80">
					<DropdownMenuLabel className="flex items-center gap-2">
						Documentos de referencia
					</DropdownMenuLabel>

					{isLoading ? (
						<DropdownMenuItem disabled>
							<span className="text-muted-foreground">Cargando documentos...</span>
						</DropdownMenuItem>
					) : documents && documents.length > 0 ? (
						<>
							<DropdownMenuSeparator />
							{documents.map((doc) => (
								<DropdownMenuItem
									key={doc.id}
									onClick={() => handleOpenDocument(doc.url, doc.id)}
									disabled={loadingDocId === doc.id}
									className="flex cursor-pointer items-center justify-between gap-2"
								>
									<div className="flex flex-1 items-center gap-2 overflow-hidden">
										{loadingDocId === doc.id ? (
											<Loader2Icon className="h-4 w-4 shrink-0 animate-spin text-teal-600" />
										) : (
											<FileTextIcon className="text-muted-foreground h-4 w-4 shrink-0" />
										)}
										<span className="truncate">{doc.name}</span>
									</div>

									{canManage ? (
										<div className="flex items-center gap-1">
											<Button
												size="icon"
												variant="ghost"
												className="h-6 w-6 hover:bg-cyan-100"
												onClick={(e) => handleEdit(doc, e)}
											>
												<EditIcon className="h-3.5 w-3.5 text-cyan-600" />
											</Button>
											<Button
												size="icon"
												variant="ghost"
												className="h-6 w-6 hover:bg-rose-100"
												onClick={(e) => handleDeleteClick(doc, e)}
											>
												<TrashIcon className="h-3.5 w-3.5 text-rose-600" />
											</Button>
										</div>
									) : (
										<ExternalLinkIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
									)}
								</DropdownMenuItem>
							))}
						</>
					) : null}

					{canManage && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => setIsCreateOpen(true)} className="cursor-pointer">
								<PlusIcon className="h-4 w-4" />
								<span>Agregar documento</span>
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Create Dialog */}
			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Agregar documento guía</DialogTitle>
						<DialogDescription>
							Agrega un nuevo documento de referencia para los contratistas
						</DialogDescription>
					</DialogHeader>
					<GuideDocumentForm
						onSuccess={() => setIsCreateOpen(false)}
						onCancel={() => setIsCreateOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Editar documento guía</DialogTitle>
						<DialogDescription>
							Modifica la información del documento de referencia
						</DialogDescription>
					</DialogHeader>
					{selectedDocument && (
						<GuideDocumentForm
							document={selectedDocument}
							onSuccess={() => {
								setIsEditOpen(false)
								setSelectedDocument(null)
							}}
							onCancel={() => {
								setIsEditOpen(false)
								setSelectedDocument(null)
							}}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. El documento &quot;{selectedDocument?.name}&quot;
							será eliminado permanentemente.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setSelectedDocument(null)}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							className="bg-red-600 hover:bg-red-700"
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? (
								<>
									<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
									Eliminando...
								</>
							) : (
								"Eliminar"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
