import { CheckCircle2, Clock, ExternalLink, Info, X } from "lucide-react"

import { StartupFolderWithDocuments } from "@/hooks/startup-folders/use-startup-folder"
import { getDocumentStatus } from "@/lib/get-document-status"
import { DocumentCategory } from "@prisma/client"
import { cn } from "@/lib/utils"
import {
	StartupFolderStructure,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import { UploadStartupFolderDocumentForm } from "../UploadStartupFolderDocumentForm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AccordionItem, AccordionContent } from "@/components/ui/accordion"
import { SubmitReviewRequestDialog } from "../SubmitReviewRequestDialog"
import StartupFolderTrigger from "./StartupFolderTrigger"
import { Button } from "@/components/ui/button"

export default function SafetyAndHealthDocuments({
	userId,
	folder,
	isEditable,
}: {
	userId: string
	folder: StartupFolderWithDocuments
	isEditable: boolean
}): React.ReactElement {
	const totalDocs = SAFETY_AND_HEALTH_STRUCTURE.documents.length
	const completedDocs = SAFETY_AND_HEALTH_STRUCTURE.documents.filter(
		(doc: StartupFolderStructure["documents"][number]) =>
			getDocumentStatus(DocumentCategory.SAFETY_AND_HEALTH, doc.type, folder.companyDocuments)
				.isUploaded
	).length
	const requiredPending = SAFETY_AND_HEALTH_STRUCTURE.documents.filter(
		(doc: StartupFolderStructure["documents"][number]) =>
			!getDocumentStatus(DocumentCategory.SAFETY_AND_HEALTH, doc.type, folder.companyDocuments)
				.isUploaded &&
			getDocumentStatus(DocumentCategory.SAFETY_AND_HEALTH, doc.type, folder.companyDocuments)
				.isRequired
	).length

	const progressPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

	const sectionDescription = SAFETY_AND_HEALTH_STRUCTURE.description

	return (
		<div className="mb-4 flex w-full items-start justify-between gap-4">
			<AccordionItem
				key={SAFETY_AND_HEALTH_STRUCTURE.title}
				value={SAFETY_AND_HEALTH_STRUCTURE.title}
				className="bg-background w-full rounded-md border border-solid px-4"
			>
				<StartupFolderTrigger
					totalDocs={totalDocs}
					completedDocs={completedDocs}
					requiredPending={requiredPending}
					progressPercentage={progressPercentage}
					sectionDescription={sectionDescription}
					title={SAFETY_AND_HEALTH_STRUCTURE.title}
				/>

				<AccordionContent>
					<div className="space-y-3 py-2">
						{SAFETY_AND_HEALTH_STRUCTURE.documents.map(
							(doc: StartupFolderStructure["documents"][number]) => {
								const { document, isUploaded, isRequired, description } = getDocumentStatus(
									SAFETY_AND_HEALTH_STRUCTURE.category,
									doc.type,
									folder.companyDocuments
								)

								const status = document?.status

								return (
									<div
										key={doc.type}
										className={cn(
											"flex items-center justify-between rounded-md p-3",
											isUploaded
												? "bg-green-500/10"
												: isRequired
													? "bg-red-500/10"
													: "bg-amber-500/10"
										)}
									>
										<div className="flex items-center">
											<div
												className={cn(
													"mr-3 flex h-8 w-8 items-center justify-center rounded-full",
													status === "DRAFT"
														? "bg-red-500/10 text-red-500"
														: status === "APPROVED"
															? "bg-green-500/10 text-green-500"
															: "bg-amber-500/10 text-amber-500"
												)}
											>
												{status === "DRAFT" ? (
													<X className="h-5 w-5" />
												) : status === "APPROVED" ? (
													<CheckCircle2 className="h-5 w-5" />
												) : (
													<Clock className="h-5 w-5" />
												)}
											</div>

											<div className="flex flex-col items-start">
												<div className="flex items-center gap-0.5">
													<p className="tezxt-left mr-1 font-medium">{doc.type}</p>
													<Tooltip delayDuration={200}>
														<TooltipTrigger className="mt-0.5 flex items-center">
															<Info className="text-muted-foreground h-4 w-4 cursor-help" />
														</TooltipTrigger>
														<TooltipContent>
															<p className="max-w-xs text-balance">{description}</p>
														</TooltipContent>
													</Tooltip>
												</div>

												<p className="text-muted-foreground text-sm">
													{status === "DRAFT"
														? "Borrador"
														: status === "APPROVED"
															? "Aprobado"
															: "En revisión"}
												</p>

												{document?.reviewNotes && (
													<div className="mt-1">
														<p className="text-sm font-medium">Observaciones:</p>
														<p className="text-sm">{document.reviewNotes}</p>
													</div>
												)}
											</div>
										</div>

										{document && (
											<div className="flex gap-2">
												{isUploaded ? (
													<div className="flex gap-2">
														<Button asChild size="sm" variant="outline">
															<a href={document.url} target="_blank" rel="noreferrer noopener">
																<ExternalLink className="mr-1 h-4 w-4" />
																Ver
															</a>
														</Button>

														{isEditable && (
															<UploadStartupFolderDocumentForm
																type={doc.type}
																userId={userId}
																isUpdate={true}
																folderId={folder.id}
																documentName={doc.type}
																documentId={document.id}
																currentUrl={document.url}
																category={SAFETY_AND_HEALTH_STRUCTURE.category}
															/>
														)}
													</div>
												) : isEditable ? (
													<UploadStartupFolderDocumentForm
														type={doc.type}
														userId={userId}
														isUpdate={false}
														folderId={folder.id}
														documentName={doc.type}
														documentId={document.id}
														category={SAFETY_AND_HEALTH_STRUCTURE.category}
													/>
												) : (
													<span className="text-muted-foreground text-sm italic">Pendiente</span>
												)}
											</div>
										)}
									</div>
								)
							}
						)}
					</div>
				</AccordionContent>
			</AccordionItem>

			<SubmitReviewRequestDialog
				folderId={folder.id}
				disabled={!isEditable}
				folderName={SAFETY_AND_HEALTH_STRUCTURE.title}
				currentUserId={userId}
			/>
		</div>
	)
}
