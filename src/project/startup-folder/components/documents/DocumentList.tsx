import { ExternalLink, Info, NotebookPenIcon } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

import { getDocumentStatus } from "@/lib/get-document-status"
import { cn } from "@/lib/utils"
import {
	ReviewStatus,
	type WorkerDocument,
	type VehicleDocument,
	type DocumentCategory,
	type EnvironmentalDocument,
	type SafetyAndHealthDocument,
} from "@prisma/client"

import { UploadStartupFolderDocumentForm } from "@/project/startup-folder/components/data/UploadStartupFolderDocumentForm"
import { DocumentReviewForm } from "@/project/startup-folder/components/data/DocumentReviewForm"
import { StartupFolderStatusBadge } from "@/shared/components/ui/startup-folder-status-badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { UpdateExpirationDateDocument } from "./UpdateExpirationDateDocument"

import type {
	WORKER_STRUCTURE,
	VEHICLE_STRUCTURE,
	StartupFolderStructure,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

interface DocumentListProps {
	userId: string
	folderId: string
	workerId?: string
	companyId: string
	vehicleId?: string
	className?: string
	isEditable: boolean
	isOtcMember?: boolean
	category: DocumentCategory
	documents:
		| SafetyAndHealthDocument[]
		| WorkerDocument[]
		| VehicleDocument[]
		| EnvironmentalDocument[]
	documentsStructure:
		| typeof SAFETY_AND_HEALTH_STRUCTURE
		| typeof VEHICLE_STRUCTURE
		| typeof ENVIRONMENTAL_STRUCTURE
		| typeof WORKER_STRUCTURE
}

export function DocumentList({
	userId,
	category,
	folderId,
	workerId,
	vehicleId,
	className,
	documents,
	companyId,
	isEditable,
	isOtcMember,
	documentsStructure,
}: DocumentListProps) {
	return (
		<div className={cn("divide-y", className)}>
			{documentsStructure.documents.map((doc: StartupFolderStructure["documents"][number]) => {
				const { isUploaded, status, document } = getDocumentStatus(category, doc.type, documents)

				return (
					<div
						key={doc.type}
						className={cn("flex items-center justify-between py-4 transition-colors")}
					>
						<div className="flex items-center gap-4">
							<StartupFolderStatusBadge status={status} />

							<div>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-0.5">
										<p className="tezxt-left mr-1 font-medium">{doc.name}</p>
										<Tooltip delayDuration={200}>
											<TooltipTrigger className="mt-0.5 flex items-center" asChild>
												<Info className="text-muted-foreground h-4 w-4 cursor-help" />
											</TooltipTrigger>
											<TooltipContent>
												<p className="max-w-xs text-balance">{doc.description}</p>
											</TooltipContent>
										</Tooltip>
									</div>
								</div>

								{document?.reviewNotes && (
									<p
										className={cn("mt-2 text-red-500", {
											"text-green-500": document.status === ReviewStatus.APPROVED,
										})}
									>
										<span className="font-medium">
											<NotebookPenIcon className="mr-1 mb-0.5 inline-flex h-4 w-4" />
											Comentarios:
										</span>{" "}
										{document.reviewNotes}
									</p>
								)}
							</div>
						</div>

						{document && (
							<>
								{isUploaded ? (
									<div className="flex items-center gap-2">
										{document.expirationDate && (
											<span className="text-muted-foreground mr-2 text-sm">
												Vence el {format(document.expirationDate, "dd/MM/yyyy")}
											</span>
										)}

										{isEditable &&
											!isOtcMember &&
											status !== ReviewStatus.APPROVED &&
											status !== ReviewStatus.SUBMITTED && (
												<UploadStartupFolderDocumentForm
													isUpdate={true}
													type={doc.type}
													userId={userId}
													folderId={folderId}
													category={category}
													companyId={companyId}
													documentName={doc.name}
													documentId={document.id}
													currentUrl={document.url}
													workerId={workerId || undefined}
													vehicleId={vehicleId || undefined}
												/>
											)}

										{isUploaded && isOtcMember && (
											<UpdateExpirationDateDocument
												folderId={folderId}
												companyId={companyId}
												documentId={document.id}
												category={category}
											/>
										)}

										<Link
											href={document.url}
											target="_blank"
											rel="noreferrer noopener"
											className="bg-primary/10 text-primary hover:bg-primary/20 border-primary flex size-9 items-center justify-center rounded-md border transition-colors"
										>
											<ExternalLink className="h-4 w-4" />
										</Link>

										{isOtcMember && status === ReviewStatus.SUBMITTED && (
											<DocumentReviewForm
												document={document}
												userId={userId}
												companyId={companyId}
											/>
										)}
									</div>
								) : (
									isEditable &&
									!isOtcMember &&
									status !== ReviewStatus.APPROVED &&
									status !== ReviewStatus.SUBMITTED && (
										<UploadStartupFolderDocumentForm
											type={doc.type}
											userId={userId}
											isUpdate={false}
											folderId={folderId}
											category={category}
											companyId={companyId}
											documentName={doc.name}
											documentId={document.id}
											workerId={workerId || undefined}
											vehicleId={vehicleId || undefined}
										/>
									)
								)}
							</>
						)}
					</div>
				)
			})}
		</div>
	)
}
