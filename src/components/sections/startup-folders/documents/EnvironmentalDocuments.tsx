import { CheckCircle2, ExternalLink, Info, X } from "lucide-react"

import { StartupFolderWithDocuments } from "@/hooks/startup-folders/use-startup-folder"
import { getDocumentStatus } from "@/lib/get-document-status"
import { DocumentCategory } from "@prisma/client"
import { cn } from "@/lib/utils"
import {
	StartupFolderStructure,
	ENVIRONMENTAL_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import { UploadStartupFolderDocumentForm } from "../UploadStartupFolderDocumentForm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AccordionItem, AccordionContent } from "@/components/ui/accordion"
import { SubmitReviewRequestDialog } from "../SubmitReviewRequestDialog"
import StartupFolderTrigger from "./StartupFolderTrigger"
import { Button } from "@/components/ui/button"

export default function EnvironmentalDocuments({
	userId,
	folder,
	isEditable,
}: {
	userId: string
	isEditable: boolean
	folder: StartupFolderWithDocuments
}): React.ReactElement {
	const totalDocs = ENVIRONMENTAL_STRUCTURE.documents.length
	const completedDocs = ENVIRONMENTAL_STRUCTURE.documents.filter(
		(doc: StartupFolderStructure["documents"][number]) =>
			getDocumentStatus(DocumentCategory.ENVIRONMENTAL, doc.type, folder.environmentalsDocuments)
				.isUploaded
	).length
	const requiredPending = ENVIRONMENTAL_STRUCTURE.documents.filter(
		(doc: StartupFolderStructure["documents"][number]) =>
			!getDocumentStatus(DocumentCategory.ENVIRONMENTAL, doc.type, folder.environmentalsDocuments)
				.isUploaded &&
			getDocumentStatus(DocumentCategory.ENVIRONMENTAL, doc.type, folder.environmentalsDocuments)
				.isRequired
	).length

	const sectionDescription = ENVIRONMENTAL_STRUCTURE.description

	const progressPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

	return (
		<div className="mb-4 flex w-full items-start justify-between gap-4">
			<AccordionItem
				key={ENVIRONMENTAL_STRUCTURE.title}
				value={ENVIRONMENTAL_STRUCTURE.title}
				className="bg-background w-full rounded-md border border-solid px-4"
			>
				<StartupFolderTrigger
					totalDocs={totalDocs}
					completedDocs={completedDocs}
					requiredPending={requiredPending}
					title={ENVIRONMENTAL_STRUCTURE.title}
					progressPercentage={progressPercentage}
					sectionDescription={sectionDescription}
				/>

				<AccordionContent>
					<div className="space-y-3 py-2">
						{ENVIRONMENTAL_STRUCTURE.documents.map(
							(doc: StartupFolderStructure["documents"][number]) => {
								const { document, isUploaded, isRequired, description } = getDocumentStatus(
									DocumentCategory.ENVIRONMENTAL,
									doc.type,
									folder.environmentalsDocuments
								)

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
													isUploaded
														? "bg-green-500/10 text-green-500"
														: isRequired
															? "bg-red-500/10 text-red-500"
															: "bg-amber-500/10 text-amber-500"
												)}
											>
												{isUploaded ? (
													<CheckCircle2 className="h-5 w-5" />
												) : (
													<X className="h-5 w-5" />
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

												<p className="text-muted-foreground text-xs">
													{isRequired ? "Requerido" : "Opcional"}
												</p>
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
																isUpdate={true}
																type={doc.type}
																userId={userId}
																folderId={folder.id}
																documentName={doc.type}
																documentId={document.id}
																currentUrl={document.url}
																category={ENVIRONMENTAL_STRUCTURE.category}
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
														category={ENVIRONMENTAL_STRUCTURE.category}
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
				currentUserId={userId}
				folderName={ENVIRONMENTAL_STRUCTURE.title}
			/>
		</div>
	)
}
