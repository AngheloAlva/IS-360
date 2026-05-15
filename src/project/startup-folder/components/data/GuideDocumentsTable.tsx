"use client"

import {
	PlusIcon,
	FileTextIcon,
	PencilIcon,
	TrashIcon,
	ExternalLinkIcon,
	Loader2Icon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
	useGuideDocuments,
	useDeleteGuideDocument,
	type GuideDocument,
} from "../../hooks/use-guide-documents"
import { GuideDocumentForm } from "../forms/GuideDocumentForm"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"

const visibilityLabels = {
	BASIC: { label: "Básica", className: "bg-blue-500/10 text-blue-500 border-blue-500" },
	FULL: { label: "Full", className: "bg-purple-500/10 text-purple-500 border-purple-500" },
	BOTH: { label: "Ambas", className: "bg-teal-500/10 text-teal-500 border-teal-500" },
}

export function GuideDocumentsTable() {
	const { data: documents, isLoading } = useGuideDocuments({ includeInactive: false })
	const deleteMutation = useDeleteGuideDocument()

	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [editingDocument, setEditingDocument] = useState<GuideDocument | null>(null)
	const [deletingDocument, setDeletingDocument] = useState<GuideDocument | null>(null)

	const handleDelete = async () => {
		if (!deletingDocument) return

		const result = await deleteMutation.mutateAsync(deletingDocument.id)

		if (result.ok) {
			toast.success(result.message)
			setDeletingDocument(null)
		} else {
			toast.error(result.message)
		}
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-72" />
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="flex items-center gap-2">
						<FileTextIcon className="h-5 w-5" />
						Documentos Guía
					</CardTitle>
					<CardDescription>
						Administra los documentos de guía que verán los contratistas en sus carpetas de arranque
					</CardDescription>
				</div>

				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusIcon className="mr-2 h-4 w-4" />
							Nuevo documento
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>Crear documento guía</DialogTitle>
							<DialogDescription>
								Agrega un nuevo documento de guía para los contratistas
							</DialogDescription>
						</DialogHeader>
						<GuideDocumentForm
							onSuccess={() => setIsCreateOpen(false)}
							onCancel={() => setIsCreateOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</CardHeader>

			<CardContent>
				{documents?.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<FileTextIcon className="text-muted-foreground mb-4 h-12 w-12" />
						<p className="text-lg font-semibold">No hay documentos guía</p>
						<p className="text-muted-foreground text-sm">
							Crea tu primer documento guía para que los contratistas puedan verlo
						</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nombre</TableHead>
								<TableHead>Visibilidad</TableHead>
								<TableHead>Orden</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{documents?.map((doc) => (
								<TableRow key={doc.id}>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-semibold">{doc.name}</span>
											{doc.description && (
												<span className="text-muted-foreground line-clamp-1 text-sm">
													{doc.description}
												</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline" className={visibilityLabels[doc.visibility].className}>
											{visibilityLabels[doc.visibility].label}
										</Badge>
									</TableCell>
									<TableCell>{doc.order}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button variant="ghost" size="icon" asChild className="h-8 w-8">
												<a href={doc.url} target="_blank" rel="noopener noreferrer">
													<ExternalLinkIcon className="h-4 w-4" />
												</a>
											</Button>

											<Dialog
												open={editingDocument?.id === doc.id}
												onOpenChange={(open) => !open && setEditingDocument(null)}
											>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => setEditingDocument(doc)}
												>
													<PencilIcon className="h-4 w-4" />
												</Button>
												<DialogContent className="max-w-lg">
													<DialogHeader>
														<DialogTitle>Editar documento guía</DialogTitle>
														<DialogDescription>Modifica los datos del documento</DialogDescription>
													</DialogHeader>
													{editingDocument && (
														<GuideDocumentForm
															document={editingDocument}
															onSuccess={() => setEditingDocument(null)}
															onCancel={() => setEditingDocument(null)}
														/>
													)}
												</DialogContent>
											</Dialog>

											<Button
												variant="ghost"
												size="icon"
												className="text-destructive hover:text-destructive h-8 w-8"
												onClick={() => setDeletingDocument(doc)}
											>
												<TrashIcon className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>

			{/* Delete confirmation dialog */}
			<AlertDialog
				open={!!deletingDocument}
				onOpenChange={(open) => !open && setDeletingDocument(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
						<AlertDialogDescription>
							El documento <strong>{deletingDocument?.name}</strong> será eliminado y los
							contratistas ya no podrán verlo.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
		</Card>
	)
}
