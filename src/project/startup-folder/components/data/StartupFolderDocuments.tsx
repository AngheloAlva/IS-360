"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { EyeIcon, SendIcon, FolderIcon, ChevronLeft, FileTextIcon, UploadIcon } from "lucide-react"
import {
	type StartupFolderDocument,
	type SafetyAndHealthStartupFolderDocument,
	type EnvironmentalStartupFolderDocument,
} from "../../types"
import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import { getCompanyEntities } from "../../actions/get-company-entities"
import {
	DocumentCategory,
	VehicleDocumentType,
	WorkerDocumentType,
	type EnvironmentalDocType,
	type SafetyAndHealthDocumentType,
} from "@prisma/client"
import { DocumentReviewForm } from "../dialogs/DocumentReviewForm"
import { queryClient } from "@/lib/queryClient"
import { StartupFolderStatusBadge } from "@/shared/components/ui/startup-folder-status-badge"
import { VehicleFolderDocuments } from "./VehicleFolderDocuments"
import { WorkerFolderDocuments } from "./WorkerFolderDocuments"
import { LinkEntityDialog } from "../dialogs/LinkEntityDialog"
import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import { getDocumentsByCategory } from "@/lib/consts/startup-folders-structure"

interface StartupFolderDocumentsProps {
	userId: string
	companyId: string
	onBack: () => void
	isOtcMember: boolean
	isSupervisor: boolean
	startupFolderId: string
	category: DocumentCategory
}

export const StartupFolderDocuments: React.FC<StartupFolderDocumentsProps> = ({
	onBack,
	userId,
	category,
	companyId,
	isOtcMember,
	isSupervisor,
	startupFolderId,
}) => {
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type:
			| WorkerDocumentType
			| VehicleDocumentType
			| EnvironmentalDocType
			| SafetyAndHealthDocumentType
		name: string
	} | null>(null)
	const [selectedDocument, setSelectedDocument] = useState<StartupFolderDocument | null>(null)
	const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null)
	const [allEntities, setAllEntities] = useState<Array<{ id: string; name: string }>>([])
	const [entities, setEntities] = useState<Array<{ id: string; name: string }>>([])
	const [showUploadDialog, setShowUploadDialog] = useState(false)
	const [showSubmitDialog, setShowSubmitDialog] = useState(false)
	const [showLinkDialog, setShowLinkDialog] = useState(false)

	const { data, isLoading, refetch } = useStartupFolderDocuments({ startupFolderId, category })
	const documentsData = data?.documents ?? []

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

	const { title, documents } = getDocumentsByCategory(category)

	const documentsNotUploaded = documents.filter(
		(doc) => !documentsData.some((d) => d.type === doc.type)
	)

	if (selectedEntity) {
		if (category === DocumentCategory.PERSONNEL) {
			return (
				<WorkerFolderDocuments
					userId={userId}
					isOtcMember={isSupervisor}
					workerId={selectedEntity.id}
					startupFolderId={startupFolderId}
					onBack={() => setSelectedEntity(null)}
					documentsNotUploaded={documentsNotUploaded}
				/>
			)
		} else if (category === DocumentCategory.VEHICLES) {
			return (
				<VehicleFolderDocuments
					userId={userId}
					isOtcMember={isSupervisor}
					vehicleId={selectedEntity.id}
					startupFolderId={startupFolderId}
					onBack={() => setSelectedEntity(null)}
					documentsNotUploaded={documentsNotUploaded}
				/>
			)
		}
	}
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button variant="ghost" className="gap-2" onClick={onBack}>
						<ChevronLeft className="h-4 w-4" />
						Volver
					</Button>

					<h2 className="text-lg font-bold">{title}</h2>
				</div>

				{!isOtcMember && (
					<div className="flex items-center gap-2">
						{(category === DocumentCategory.PERSONNEL ||
							category === DocumentCategory.VEHICLES) && (
							<Button variant="outline" onClick={() => setShowLinkDialog(true)} className="gap-2">
								<FolderIcon className="h-4 w-4" />
								Vincular {category === DocumentCategory.PERSONNEL ? "Personal" : "Vehículo"}
							</Button>
						)}
						<Button variant="outline" onClick={() => setShowUploadDialog(true)} className="gap-2">
							<UploadIcon className="h-4 w-4" />
							Subir documento
						</Button>

						{documentsData.length > 0 &&
							documentsData.every((doc) => doc.status === "DRAFT" || doc.status === "REJECTED") && (
								<Button
									variant="outline"
									className="gap-2"
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
								<TableRow key={entity.id} className="hover:bg-accent/50">
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											<FolderIcon className="h-4 w-4 text-teal-500" />
											{entity.name}
										</div>
									</TableCell>
									<TableCell colSpan={3}></TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											className="gap-2"
											onClick={() => setSelectedEntity(entity)}
											aria-label={`Ver documentos de ${entity.name}`}
										>
											Ver documentos
										</Button>
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
					) : (
						documentsData.map((doc: StartupFolderDocument) => (
							<TableRow key={doc.id}>
								<TableCell className="font-medium">
									<div className="flex flex-col items-start justify-center">
										<div className="flex items-center gap-2">
											<FileTextIcon className="h-4 w-4 text-teal-500" />
											{doc.name}
										</div>

										{doc.status === "REJECTED" && (
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
														const baseDoc = {
															id: doc.id,
															name: doc.name,
															url: doc.url,
															status: doc.status,
															uploadedBy: doc.uploadedBy,
															uploadedById: doc.uploadedById,
															uploadedAt: doc.uploadedAt,
															reviewedAt: doc.reviewedAt,
															reviewNotes: doc.reviewNotes,
															submittedAt: doc.submittedAt,
															expirationDate: doc.expirationDate,
															folderId: doc.folderId,
														}

														let selectedDoc: StartupFolderDocument
														switch (category) {
															case DocumentCategory.SAFETY_AND_HEALTH: {
																const safetyDoc: SafetyAndHealthStartupFolderDocument = {
																	...baseDoc,
																	category: DocumentCategory.SAFETY_AND_HEALTH,
																	type: doc.type as SafetyAndHealthDocumentType,
																}
																selectedDoc = safetyDoc
																break
															}
															case DocumentCategory.ENVIRONMENTAL: {
																const envDoc: EnvironmentalStartupFolderDocument = {
																	...baseDoc,
																	category: DocumentCategory.ENVIRONMENTAL,
																	type: doc.type as EnvironmentalDocType,
																}
																selectedDoc = envDoc
																break
															}
															default:
																throw new Error(`Invalid category: ${category}`)
														}
														setSelectedDocumentType({ type: doc.type, name: doc.name })
														setSelectedDocument(selectedDoc)
														setShowUploadDialog(true)
													}}
												>
													<UploadIcon className="h-4 w-4" />
												</Button>
											)}
										{isSupervisor && doc.status === "SUBMITTED" && (
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
					)}

					{documentsNotUploaded.length > 0 &&
						documentsNotUploaded.map((doc) => (
							<TableRow key={doc.name}>
								<TableCell className="font-medium">
									<div className="flex flex-col items-start justify-center">
										<div className="flex items-center gap-2">
											<FileTextIcon className="h-4 w-4 text-teal-500" />
											{doc.name}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<StartupFolderStatusBadge status={"DRAFT"} />
								</TableCell>
								<TableCell></TableCell>
								<TableCell>N/A</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										{!isOtcMember && (
											<Button
												size={"icon"}
												variant="ghost"
												className="text-cyan-600"
												onClick={() => {
													setShowUploadDialog(true)
													setSelectedDocumentType({ type: doc.type, name: doc.name })
												}}
											>
												<UploadIcon className="h-4 w-4" />
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>

			{showUploadDialog && (
				<UploadDocumentsDialog
					userId={userId}
					category={category}
					isOpen={showUploadDialog}
					startupFolderId={startupFolderId}
					documentType={selectedDocumentType}
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
							queryKey: ["startup-folder-documents", { startupFolderId, category }] as const,
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
