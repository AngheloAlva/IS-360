"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import {
	Upload,
	EyeIcon,
	SendIcon,
	Trash2Icon,
	FolderIcon,
	PencilIcon,
	ChevronLeft,
	ChevronRight,
	FileTextIcon,
	PlusCircleIcon,
} from "lucide-react"

import { deleteStartupFolderDocument } from "../../actions/delete-startup-folder-document"
import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import { getCompanyEntities } from "../../actions/get-company-entities"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { DocumentReviewForm } from "../dialogs/DocumentReviewForm"
import { queryClient } from "@/lib/queryClient"

import { StartupFolderStatusBadge } from "@/shared/components/ui/startup-folder-status-badge"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
import { VehicleFolderDocuments } from "./VehicleFolderDocuments"
import { WorkerFolderDocuments } from "./WorkerFolderDocuments"
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

import type { StartupFolderDocument } from "@/project/startup-folder/types"

interface StartupFolderDocumentsProps {
	userId: string
	companyId: string
	onBack: () => void
	isOtcMember: boolean
	startupFolderId: string
	canAddDocuments: boolean
	category: DocumentCategory
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
	isOtcMember,
	startupFolderId,
	canAddDocuments,
}: StartupFolderDocumentsProps) {
	const [selectedDocument, setSelectedDocument] = useState<StartupFolderDocument | null>(null)
	const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null)
	const [entities, setEntities] = useState<Array<{ id: string; name: string }>>([])
	const [allEntities, setAllEntities] = useState<SelectedEntity[]>([])
	const [showUploadDialog, setShowUploadDialog] = useState(false)
	const [showSubmitDialog, setShowSubmitDialog] = useState(false)
	const [showLinkDialog, setShowLinkDialog] = useState(false)
	const [multiple, setMultiple] = useState(true)

	const { data, isLoading, refetch } = useStartupFolderDocuments({ startupFolderId, category })
	const documents = data?.documents ?? []

	const fetchEntities = useCallback(async () => {
		try {
			if (category === DocumentCategory.PERSONNEL || category === DocumentCategory.VEHICLES) {
				const { allEntities, vinculatedEntities } = await getCompanyEntities({
					companyId,
					category,
					startupFolderId,
				})
				setEntities(vinculatedEntities)
				setAllEntities(allEntities)
			}
		} catch (error) {
			console.error("Error fetching entities:", error)
			toast.error("Error al cargar las entidades")
		}
	}, [category, companyId, startupFolderId])

	useEffect(() => {
		fetchEntities()
	}, [fetchEntities])

	if (selectedEntity) {
		if (category === DocumentCategory.PERSONNEL) {
			return (
				<WorkerFolderDocuments
					userId={userId}
					isOtcMember={isOtcMember}
					workerId={selectedEntity.id}
					startupFolderId={startupFolderId}
					onBack={() => setSelectedEntity(null)}
				/>
			)
		} else if (category === DocumentCategory.VEHICLES) {
			return (
				<VehicleFolderDocuments
					userId={userId}
					isOtcMember={isOtcMember}
					vehicleId={selectedEntity.id}
					startupFolderId={startupFolderId}
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

				{canAddDocuments && (
					<div className="flex items-center gap-2">
						{(category === DocumentCategory.PERSONNEL ||
							category === DocumentCategory.VEHICLES) && (
							<Button variant="outline" className="gap-1.5" onClick={() => setShowLinkDialog(true)}>
								<PlusCircleIcon className="size-3.5" />
								Vincular {category === DocumentCategory.PERSONNEL ? "trabajador" : "vehículo"}
							</Button>
						)}

						<Button
							className="cursor-pointer gap-1.5 bg-cyan-600 transition-all hover:scale-105 hover:bg-cyan-700 hover:text-white"
							onClick={() => {
								setMultiple(true)
								setShowUploadDialog(true)
							}}
						>
							<Upload className="h-4 w-4" />
							Subir documentos
						</Button>

						{documents.length > 0 &&
							documents.every((doc) => doc.status === "DRAFT" || doc.status === "REJECTED") && (
								<Button
									variant="outline"
									className="cursor-pointer gap-1.5 bg-emerald-600 transition-all hover:scale-105 hover:bg-emerald-700 hover:text-white"
									onClick={() => setShowSubmitDialog(true)}
								>
									<SendIcon className="h-4 w-4" />
									Enviar a revisión
								</Button>
							)}
					</div>
				)}
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
						entities?.length > 0 ? (
							entities?.map((entity) => (
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
						) : (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center">
									No hay documentos subidos en esta subcarpeta
								</TableCell>
							</TableRow>
						)
					) : documents.length > 0 ? (
						documents.map((doc) => (
							<TableRow key={doc.id}>
								<TableCell className="font-medium">
									<div className="flex flex-col items-start justify-center">
										<div className="flex items-center gap-2">
											<FileTextIcon className="h-4 w-4 text-teal-500" />
											{doc.name}
										</div>

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
										{!isOtcMember &&
											(doc.status === "DRAFT" ||
												doc.status === "REJECTED" ||
												doc.status === "EXPIRED") && (
												<Button
													size={"icon"}
													variant="ghost"
													className="text-cyan-600"
													onClick={() => {
														setMultiple(false)
														setSelectedDocument(doc)
														setShowUploadDialog(true)
													}}
												>
													<PencilIcon className="h-4 w-4" />
												</Button>
											)}
										{!isOtcMember && doc.status === "DRAFT" && (
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
										{isOtcMember && doc.status === "SUBMITTED" && (
											<DocumentReviewForm
												document={doc}
												userId={userId}
												refetch={refetch}
												startupFolderId={startupFolderId}
											/>
										)}
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="h-24 text-center">
								No hay documentos subidos en esta subcarpeta
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{showUploadDialog && (
				<UploadDocumentsDialog
					userId={userId}
					multiple={multiple}
					category={category}
					isOpen={showUploadDialog}
					startupFolderId={startupFolderId}
					documentToUpdate={selectedDocument}
					onClose={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
					}}
					onUploadComplete={() => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
					}}
				/>
			)}

			{showLinkDialog && (category === "PERSONNEL" || category === "VEHICLES") && (
				<LinkEntityDialog
					category={category}
					entities={allEntities}
					isOpen={showLinkDialog}
					startupFolderId={startupFolderId}
					onClose={() => setShowLinkDialog(false)}
					onSuccess={() => {
						setShowLinkDialog(false)
					}}
				/>
			)}

			{showSubmitDialog && (
				<SubmitReviewRequestDialog
					userId={userId}
					category={category}
					companyId={companyId}
					isOpen={showSubmitDialog}
					folderId={startupFolderId}
					onClose={() => setShowSubmitDialog(false)}
					onSuccess={async () => {
						queryClient.invalidateQueries({
							queryKey: ["startupFolderDocuments", { startupFolderId, category }],
						})
						setShowSubmitDialog(false)
						await refetch()
						toast.success("Documentos enviados a revisión exitosamente")
					}}
				/>
			)}
		</div>
	)
}
