"use client"

import { ChevronLeft, EyeIcon, FileTextIcon, PencilIcon, UploadIcon } from "lucide-react"
import { useState } from "react"

import { useStartupFolderDocuments } from "../../hooks/use-startup-folder-documents"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { type StartupFolderDocument } from "@/project/startup-folder/types"

import { StartupFolderStatusBadge } from "@/shared/components/ui/startup-folder-status-badge"
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
import { DocumentReviewForm } from "../dialogs/DocumentReviewForm"
import type {
	SafetyAndHealthDocumentType,
	VehicleDocumentType,
	WorkerDocumentType,
	EnvironmentalDocType,
} from "@prisma/client"

interface WorkerFolderDocumentsProps {
	userId: string
	workerId: string
	onBack: () => void
	isOtcMember: boolean
	startupFolderId: string
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

export function WorkerFolderDocuments({
	onBack,
	userId,
	workerId,
	isOtcMember,
	startupFolderId,
	documentsNotUploaded,
}: WorkerFolderDocumentsProps) {
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

	const { data, isLoading, refetch } = useStartupFolderDocuments({
		category: DocumentCategory.PERSONNEL,
		workerId,
	})
	const documents = data?.documents ?? []

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Button variant="ghost" className="cursor-pointer gap-1" onClick={onBack}>
					<ChevronLeft className="h-4 w-4" />
					Volver
				</Button>
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
												category={DocumentCategory.PERSONNEL}
											/>
										)}
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="h-24 text-center">
								No hay documentos subidos para este trabajador
							</TableCell>
						</TableRow>
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
					category="PERSONNEL"
					userId={userId}
					workerId={workerId}
					isOpen={showUploadDialog}
					startupFolderId={startupFolderId}
					documentType={selectedDocumentType}
					documentToUpdate={selectedDocument}
					onClose={() => {
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
		</div>
	)
}
