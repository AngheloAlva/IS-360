"use client"

import {
	ChevronLeft,
	ChevronRight,
	EyeIcon,
	FolderIcon,
	PencilIcon,
	Trash2Icon,
	Upload,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { WorkerFolderDocuments } from "./WorkerFolderDocuments"
import { VehicleFolderDocuments } from "./VehicleFolderDocuments"
import { toast } from "sonner"

import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import { getCompanyEntities } from "../../actions/get-company-entities"
import { deleteStartupFolderDocument } from "../../actions/delete-startup-folder-document"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { type StartupFolderDocument } from "@/project/startup-folder/types"

import { StartupFolderStatusBadge } from "@/shared/components/ui/startup-folder-status-badge"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
import { LinkEntityDialog } from "../dialogs/LinkEntityDialog"
import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

interface StartupFolderDocumentsProps {
	category: DocumentCategory
	startupFolderId: string
	userId: string
	companyId: string
	onBack: () => void
}

interface SelectedEntity {
	id: string
	name: string
}

export function StartupFolderDocuments({
	onBack,
	userId,
	category,
	companyId,
	startupFolderId,
}: StartupFolderDocumentsProps) {
	const [selectedDocument, setSelectedDocument] = useState<StartupFolderDocument | null>(null)
	const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null)
	const [entities, setEntities] = useState<Array<{ id: string; name: string }>>([])
	const [showUploadDialog, setShowUploadDialog] = useState(false)
	const [showLinkDialog, setShowLinkDialog] = useState(false)

	const { data, isLoading, refetch } = useStartupFolderDocuments({ startupFolderId, category })
	const documents = data?.documents ?? []

	const fetchEntities = useCallback(async () => {
		try {
			if (category === DocumentCategory.PERSONNEL || category === DocumentCategory.VEHICLES) {
				const entities = await getCompanyEntities({ companyId, category })
				setEntities(entities)
			}
		} catch (error) {
			console.error("Error fetching entities:", error)
			toast.error("Error al cargar las entidades")
		}
	}, [category, companyId])

	useEffect(() => {
		fetchEntities()
	}, [fetchEntities])

	if (selectedEntity) {
		if (category === DocumentCategory.PERSONNEL) {
			return (
				<WorkerFolderDocuments
					workerId={selectedEntity.id}
					userId={userId}
					onBack={() => setSelectedEntity(null)}
				/>
			)
		} else if (category === DocumentCategory.VEHICLES) {
			return (
				<VehicleFolderDocuments
					vehicleId={selectedEntity.id}
					userId={userId}
					onBack={() => setSelectedEntity(null)}
				/>
			)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Button variant="ghost" className="cursor-pointer gap-1" onClick={onBack}>
					<ChevronLeft className="h-4 w-4" />
					Volver
				</Button>

				<div className="flex items-center gap-2">
					{(category === DocumentCategory.PERSONNEL || category === DocumentCategory.VEHICLES) && (
						<Button variant="outline" onClick={() => setShowLinkDialog(true)}>
							Vincular {category === DocumentCategory.PERSONNEL ? "trabajador" : "vehículo"}
						</Button>
					)}
					<Button
						className="cursor-pointer gap-2 bg-cyan-600 transition-all hover:scale-105 hover:bg-cyan-700 hover:text-white"
						onClick={() => setShowUploadDialog(true)}
					>
						<Upload className="h-4 w-4" />
						Subir documento
					</Button>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nombre</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead>Subido por</TableHead>
						<TableHead>Fecha de vencimiento</TableHead>
						<TableHead className="w-[100px]"></TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={5} className="h-24 text-center">
								Cargando documentos...
							</TableCell>
						</TableRow>
					) : category === DocumentCategory.PERSONNEL || category === DocumentCategory.VEHICLES ? (
						entities.map((entity) => (
							<TableRow
								key={entity.id}
								className="cursor-pointer"
								onClick={() => setSelectedEntity(entity)}
							>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<FolderIcon className="h-4 w-4 text-teal-500" />
										{entity.name}
									</div>
								</TableCell>
								<TableCell colSpan={3}></TableCell>
								<TableCell>
									<ChevronRight className="h-4 w-4" />
								</TableCell>
							</TableRow>
						))
					) : documents.length > 0 ? (
						documents.map((doc) => (
							<TableRow key={doc.id}>
								<TableCell className="font-medium">
									<div className="flex flex-col items-start justify-center">
										{doc.name}

										{doc.status === ReviewStatus.REJECTED && (
											<span className="text-rose-500">Rechazado: {doc.reviewNotes}</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<StartupFolderStatusBadge status={doc.status} />
								</TableCell>
								<TableCell>{doc.uploadedBy?.name ?? "Usuario desconocido"}</TableCell>
								<TableCell>
									{doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString() : "N/A"}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										{doc.url && (
											<Button
												size={"icon"}
												variant="ghost"
												className="text-teal-600"
												onClick={() => window.open(doc.url!, "_blank")}
											>
												<EyeIcon className="h-4 w-4" />
											</Button>
										)}
										{(doc.status === "DRAFT" ||
											doc.status === "REJECTED" ||
											doc.status === "EXPIRED") && (
											<Button
												size={"icon"}
												variant="ghost"
												className="text-amber-600"
												onClick={() => {
													setSelectedDocument(doc)
													setShowUploadDialog(true)
												}}
											>
												<PencilIcon className="h-4 w-4" />
											</Button>
										)}
										{doc.status === "DRAFT" && (
											<Button
												size={"icon"}
												variant="ghost"
												className="text-rose-600"
												onClick={async () => {
													try {
														await deleteStartupFolderDocument({
															data: {
																documentId: doc.id,
																category,
															},
															userId,
														})
														await refetch()
														toast.success("Documento eliminado exitosamente")
													} catch (error) {
														console.error("Error deleting document:", error)
														toast.error("Error al eliminar el documento")
													}
												}}
											>
												<Trash2Icon className="h-4 w-4" />
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="h-24 text-center">
								No hay documentos subidos en esta categoría
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{showUploadDialog && (
				<UploadDocumentsDialog
					category={category}
					startupFolderId={startupFolderId}
					userId={userId}
					isOpen={showUploadDialog}
					onClose={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
					}}
					onUploadComplete={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
					}}
					documentToUpdate={selectedDocument}
				/>
			)}

			{showLinkDialog && (category === "PERSONNEL" || category === "VEHICLES") && (
				<LinkEntityDialog
					category={category}
					startupFolderId={startupFolderId}
					entities={entities}
					isOpen={showLinkDialog}
					onClose={() => setShowLinkDialog(false)}
					onSuccess={() => {
						setShowLinkDialog(false)
					}}
				/>
			)}
		</div>
	)
}
