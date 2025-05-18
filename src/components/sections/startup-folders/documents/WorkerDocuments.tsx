import { CheckCircle2, Clock, ExternalLink, Info, User as UserIcon, X } from "lucide-react"

import { WORKER_STRUCTURE } from "@/lib/consts/startup-folders-structure"
import { getDocumentStatus } from "@/lib/get-document-status"
import { cn } from "@/lib/utils"
import { ReviewStatus, type DocumentCategory, type WorkerDocumentType } from "@prisma/client"

import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { UploadStartupFolderDocumentForm } from "../UploadStartupFolderDocumentForm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SubmitReviewRequestDialog } from "../SubmitReviewRequestDialog"
import StartupFolderTrigger from "./StartupFolderTrigger"
import { Button } from "@/components/ui/button"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion"

import type { StartupFolderWithDocuments } from "@/hooks/startup-folders/use-startup-folder"

interface WorkerDocumentsProps {
	userId: string
	isEditable: boolean
	startupFolderId: string
	additionalNotificationEmails: string[]
	folders: StartupFolderWithDocuments["workersFolders"]
}

export default function WorkerDocuments({
	userId,
	folders,
	isEditable,
	startupFolderId,
	additionalNotificationEmails,
}: WorkerDocumentsProps): React.ReactElement {
	const totalExpectedDocsPerWorker = WORKER_STRUCTURE.documents.length
	let overallUploadedDocsCount = 0
	let overallRequiredPendingDocsCount = 0

	folders.forEach((folder) => {
		WORKER_STRUCTURE.documents.forEach((docStruct) => {
			const { isUploaded, isRequired } = getDocumentStatus(
				WORKER_STRUCTURE.category as DocumentCategory,
				docStruct.type,
				folder.documents
			)

			if (isUploaded) overallUploadedDocsCount++
			if (isRequired && !isUploaded) overallRequiredPendingDocsCount++
		})
	})

	const totalDocsForSection =
		totalExpectedDocsPerWorker *
		Math.max(1, folders.length > 0 ? folders.length : isEditable ? 1 : 0)

	const progressPercentage =
		totalDocsForSection > 0 ? Math.round((overallUploadedDocsCount / totalDocsForSection) * 100) : 0

	const shouldShowEmptyState = folders.length === 0 && !isEditable

	if (shouldShowEmptyState) {
		return (
			<div className="space-y-4">
				<StartupFolderTrigger
					title={WORKER_STRUCTURE.title}
					totalDocs={totalDocsForSection}
					progressPercentage={progressPercentage}
					completedDocs={overallUploadedDocsCount}
					requiredPending={overallRequiredPendingDocsCount}
					sectionDescription={WORKER_STRUCTURE.description}
				/>

				{isEditable && (
					<div className="rounded-lg border border-dashed p-8 text-center">
						<UserIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-medium">No hay trabajadores con documentación</h3>
						<p className="text-muted-foreground mb-4">
							Comienza agregando un trabajador para gestionar su documentación.
						</p>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="mb-4 flex w-full items-start justify-between gap-4">
			<AccordionItem
				key={WORKER_STRUCTURE.title}
				value={WORKER_STRUCTURE.title}
				className="bg-background mb-4 w-full rounded-md border border-solid px-4"
			>
				<StartupFolderTrigger
					title={WORKER_STRUCTURE.title}
					totalDocs={totalDocsForSection}
					progressPercentage={progressPercentage}
					completedDocs={overallUploadedDocsCount}
					requiredPending={overallRequiredPendingDocsCount}
					sectionDescription={WORKER_STRUCTURE.description}
				/>

				<AccordionContent>
					{folders.length === 0 && (
						<div className="text-muted-foreground py-2 text-center text-sm">
							{isEditable
								? "No hay trabajadores con documentación. Puede agregar documentos de trabajador utilizando la opción Subir Documento General para Trabajadores."
								: "No hay documentación de trabajadores para mostrar."}
						</div>
					)}

					<div className="space-y-6 py-2">
						<Accordion type="multiple" className="space-y-4">
							{folders.map((folder) => {
								const totalDocumentsUploaded = folder.documents.filter(
									(doc) => doc.url !== ""
								).length

								return (
									<AccordionItem
										key={folder.id}
										value={folder.id}
										className="border-muted rounded-md border"
									>
										<AccordionTrigger className="cursor-pointer px-4 py-3 hover:no-underline">
											<div className="flex items-center">
												<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
													<UserIcon className="h-4 w-4" />
												</div>

												<div className="flex flex-col">
													<span className="font-medium">{folder.worker.name}</span>
													<span className="text-muted-foreground text-sm">
														{totalDocumentsUploaded} de {WORKER_STRUCTURE.documents.length}{" "}
														documentos agregados
													</span>
												</div>
											</div>
										</AccordionTrigger>

										<AccordionContent className="px-4 pt-0 pb-2">
											<div className="grid gap-3 pt-2">
												{WORKER_STRUCTURE.documents.map((docStruct) => {
													const { document, isUploaded, isRequired, description, status } =
														getDocumentStatus(
															WORKER_STRUCTURE.category,
															docStruct.type,
															folder.documents
														)

													return (
														<div
															key={docStruct.name}
															className={cn(
																"flex items-center justify-between rounded-md p-3",
																isUploaded
																	? status === ReviewStatus.APPROVED
																		? "bg-green-500/10"
																		: status === ReviewStatus.REJECTED
																			? "bg-red-500/10"
																			: "bg-amber-500/10"
																	: isRequired
																		? "bg-red-500/10"
																		: "bg-gray-500/10"
															)}
														>
															<div className="flex items-center">
																<div
																	className={cn(
																		"mr-3 flex h-8 w-8 items-center justify-center rounded-full",
																		isUploaded
																			? status === ReviewStatus.APPROVED
																				? "bg-green-500/10 text-green-500"
																				: status === ReviewStatus.REJECTED
																					? "bg-red-500/10 text-red-500"
																					: "bg-amber-500/10 text-amber-500"
																			: isRequired
																				? "bg-red-500/10 text-red-500"
																				: "bg-gray-500/10 text-gray-500"
																	)}
																>
																	{isUploaded ? (
																		status === ReviewStatus.APPROVED ? (
																			<CheckCircle2 className="h-5 w-5" />
																		) : status === ReviewStatus.REJECTED ? (
																			<X className="h-5 w-5" />
																		) : (
																			<Clock className="h-5 w-5" />
																		)
																	) : (
																		<X className="h-5 w-5" />
																	)}
																</div>

																<div className="flex flex-col items-start">
																	<div className="flex items-center gap-0.5">
																		<p className="font-medium">{docStruct.name}</p>
																		{description && (
																			<Tooltip delayDuration={200}>
																				<TooltipTrigger className="mt-0.5 flex items-center">
																					<Info className="text-muted-foreground h-4 w-4 cursor-help" />
																				</TooltipTrigger>
																				<TooltipContent>
																					<p className="max-w-xs text-balance">{description}</p>
																				</TooltipContent>
																			</Tooltip>
																		)}
																	</div>
																	<div className="space-y-1">
																		<div className="flex items-center gap-1">
																			<StartupFolderStatusBadge status={status} />

																			{isUploaded && document?.expirationDate && (
																				<Tooltip>
																					<TooltipTrigger asChild>
																						<span className="ml-1.5 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
																							Vence:{" "}
																							{new Date(
																								document.expirationDate
																							).toLocaleDateString()}
																						</span>
																					</TooltipTrigger>
																					<TooltipContent>
																						<p>
																							Fecha de vencimiento:{" "}
																							{new Date(
																								document.expirationDate
																							).toLocaleDateString()}
																						</p>
																						{document.expirationDate < new Date() && (
																							<p className="mt-1 font-medium text-red-500">
																								¡Documento vencido!
																							</p>
																						)}
																					</TooltipContent>
																				</Tooltip>
																			)}
																			{isUploaded && document?.reviewNotes && (
																				<Tooltip>
																					<TooltipTrigger asChild>
																						<Info className="text-muted-foreground ml-1 h-4 w-4" />
																					</TooltipTrigger>
																					<TooltipContent>
																						<p className="max-w-xs">{document.reviewNotes}</p>
																					</TooltipContent>
																				</Tooltip>
																			)}
																		</div>
																	</div>
																</div>
															</div>

															<div className="flex gap-2">
																{isUploaded && document ? (
																	<div className="flex gap-2">
																		<Button asChild size="sm" variant="outline">
																			<a
																				href={document.url}
																				target="_blank"
																				rel="noreferrer noopener"
																			>
																				<ExternalLink className="mr-1 h-4 w-4" />
																				Ver
																			</a>
																		</Button>

																		{isEditable && (
																			<UploadStartupFolderDocumentForm
																				type={docStruct.type as WorkerDocumentType}
																				userId={userId}
																				isUpdate={true}
																				documentId={document.id}
																				currentUrl={document.url}
																				folderId={startupFolderId}
																				workerId={folder.worker.id}
																				documentName={docStruct.name}
																				category={WORKER_STRUCTURE.category}
																			/>
																		)}
																	</div>
																) : isEditable && document ? (
																	<UploadStartupFolderDocumentForm
																		type={docStruct.type as WorkerDocumentType}
																		userId={userId}
																		isUpdate={false}
																		documentId={document.id}
																		folderId={startupFolderId}
																		workerId={folder.worker.id}
																		documentName={docStruct.name}
																		category={WORKER_STRUCTURE.category}
																	/>
																) : (
																	<span className="text-muted-foreground text-sm italic">
																		{isRequired ? "Pendiente" : "Opcional"}
																	</span>
																)}
															</div>
														</div>
													)
												})}
											</div>
										</AccordionContent>
									</AccordionItem>
								)
							})}
						</Accordion>
					</div>
				</AccordionContent>
			</AccordionItem>

			<SubmitReviewRequestDialog
				disabled={!isEditable}
				folderId={startupFolderId}
				folderName={WORKER_STRUCTURE.title}
				additionalNotificationEmails={additionalNotificationEmails}
			/>
		</div>
	)
}
