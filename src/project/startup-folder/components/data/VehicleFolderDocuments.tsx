"use client"

import { ChevronLeft, EyeIcon, FileTextIcon, PencilIcon, SendIcon, UploadIcon } from "lucide-react"
import { useState } from "react"

import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import {
	DocumentCategory,
	EnvironmentalDocType,
	ReviewStatus,
	SafetyAndHealthDocumentType,
	VehicleDocumentType,
	WorkerDocumentType,
} from "@prisma/client"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import { UploadDocumentsDialog } from "../forms/UploadDocumentsDialog"
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
import { DocumentReviewForm } from "../dialogs/DocumentReviewForm"
import { Progress } from "@/shared/components/ui/progress"
import { SubmitReviewRequestDialog } from "../dialogs/SubmitReviewRequestDialog"
import { queryClient } from "@/lib/queryClient"
import { toast } from "sonner"

interface VehicleFolderDocumentsProps {
	userId: string
	vehicleId: string
	companyId: string
	onBack: () => void
	isOtcMember: boolean
	startupFolderId: string
	folderStatus: ReviewStatus
	documentsNotUploaded: {
		name: string
		required: boolean
		description?: string
		type:
			| SafetyAndHealthDocumentType
			| VehicleDocumentType
			| WorkerDocumentType
			| EnvironmentalDocType
	}[]
}

export function VehicleFolderDocuments({
	onBack,
	userId,
	vehicleId,
	companyId,
	isOtcMember,
	folderStatus,
	startupFolderId,
	documentsNotUploaded,
}: VehicleFolderDocumentsProps) {
	const [selectedDocument, setSelectedDocument] = useState<StartupFolderDocument | null>(null)
	const [selectedDocumentType, setSelectedDocumentType] = useState<{
		type:
			| WorkerDocumentType
			| VehicleDocumentType
			| EnvironmentalDocType
			| SafetyAndHealthDocumentType
		name: string
	} | null>(null)
	const [showUploadDialog, setShowUploadDialog] = useState(false)
	const [showSubmitDialog, setShowSubmitDialog] = useState(false)

	const { data, isLoading, refetch } = useStartupFolderDocuments({
		category: DocumentCategory.VEHICLES,
		vehicleId,
	})
	const documents = data?.documents ?? []

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button variant="outline" size={"sm"} className="gap-2" onClick={onBack}>
						<ChevronLeft className="h-4 w-4" />
						Volver
					</Button>
					<h2 className="text-lg font-bold">Documentación de vehículos y equipos</h2>
				</div>

				<Progress
					value={(data?.approvedDocuments ?? 0) / (data?.totalDocuments ?? 0)}
					className="mr-4 ml-auto max-w-24"
				/>

				{data?.folderStatus === "DRAFT" && documents.length > 0 && (
					<Button
						className="gap-2 bg-emerald-600 text-white transition-all hover:scale-105 hover:bg-emerald-700 hover:text-white"
						onClick={() => setShowSubmitDialog(true)}
					>
						<SendIcon className="h-4 w-4" />
						Enviar a revisión
					</Button>
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
											<span className="max-w-80 text-wrap text-rose-500">
												Rechazado: {doc.reviewNotes}
											</span>
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
														setSelectedDocument(doc)
														setShowUploadDialog(true)
													}}
												>
													<PencilIcon className="h-4 w-4" />
												</Button>
											)}
										{isOtcMember && doc.status === "SUBMITTED" && (
											<DocumentReviewForm
												document={doc}
												userId={userId}
												refetch={refetch}
												startupFolderId={startupFolderId}
												category={DocumentCategory.VEHICLES}
											/>
										)}
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="h-24 text-center">
								No hay documentos subidos para este vehículo
							</TableCell>
						</TableRow>
					)}

					{folderStatus === "DRAFT" &&
						documentsNotUploaded.length > 0 &&
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
									<StartupFolderStatusBadge status={"NOT_UPLOADED"} />
								</TableCell>
								<TableCell></TableCell>
								<TableCell></TableCell>
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
					category="VEHICLES"
					userId={userId}
					vehicleId={vehicleId}
					isOpen={showUploadDialog}
					startupFolderId={startupFolderId}
					documentToUpdate={selectedDocument}
					documentType={selectedDocumentType}
					onClose={() => {
						queryClient.invalidateQueries({
							queryKey: [
								"startupFolderDocuments",
								{ startupFolderId, category: DocumentCategory.VEHICLES, vehicleId },
							],
						})
						setShowUploadDialog(false)
						setSelectedDocument(null)
					}}
					onUploadComplete={async () => {
						setShowUploadDialog(false)
						setSelectedDocument(null)
						await refetch()
					}}
				/>
			)}

			{showSubmitDialog && (
				<SubmitReviewRequestDialog
					userId={userId}
					vehicleId={vehicleId}
					companyId={companyId}
					isOpen={showSubmitDialog}
					folderId={startupFolderId}
					category={DocumentCategory.VEHICLES}
					onClose={() => setShowSubmitDialog(false)}
					onSuccess={async () => {
						queryClient.invalidateQueries({
							queryKey: [
								"startupFolderDocuments",
								{ startupFolderId, category: DocumentCategory.VEHICLES, vehicleId },
							],
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
