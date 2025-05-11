"use client"

import { CheckCircle2, FileText, X, AlertCircle, ExternalLink, Info } from "lucide-react"

import { WorkOrderStartupFolderWithDocuments } from "@/hooks/startup-folders/use-work-order-startup-folder"
import { DOCUMENT_DESCRIPTIONS, SECTION_DESCRIPTIONS } from "./WorkOrderDocumentDescriptions"
import { WORK_ORDER_STARTUP_FOLDER_STRUCTURE } from "@/lib/consts/startup-folders"
import { cn } from "@/lib/utils"

import { UploadStartupFolderDocumentForm } from "../UploadStartupFolderDocumentForm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion"

interface WorkOrderStartupFolderDocumentsProps {
	folder: WorkOrderStartupFolderWithDocuments
	isEditable: boolean
}

export function WorkOrderStartupFolderDocuments({
	folder,
	isEditable = false,
}: WorkOrderStartupFolderDocumentsProps) {
	const getDocumentsByType = (type: string) => {
		switch (type) {
			case "vehicle":
				return folder.vehicles || []
			case "procedure":
				return folder.procedures || []
			case "environmental":
				return folder.environmentals || []
			default:
				return []
		}
	}

	const getDocumentStatus = (
		sectionKey: string,
		documentName: string,
		documentType: "vehicle" | "procedure" | "environmental" | "company"
	) => {
		const documents = getDocumentsByType(documentType)
		const document = documents.find((doc) => doc.name === documentName)

		return {
			document,
			isUploaded: !!document && document.url !== "",
			isRequired:
				WORK_ORDER_STARTUP_FOLDER_STRUCTURE[
					sectionKey as keyof typeof WORK_ORDER_STARTUP_FOLDER_STRUCTURE
				].documents.find((doc) => doc.name === documentName)?.required || false,
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">Documentos requeridos</h2>

				<div className="text-muted-foreground flex items-center gap-5 text-sm">
					<div className="flex items-center">
						<div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
						<span>Completados</span>
					</div>
					<div className="flex items-center">
						<div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
						<span>Pendientes (opcionales)</span>
					</div>
					<div className="flex items-center">
						<div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
						<span>Pendientes (requeridos)</span>
					</div>
				</div>
			</div>

			<Accordion type="multiple">
				{Object.entries(WORK_ORDER_STARTUP_FOLDER_STRUCTURE).map(([sectionKey, section]) => {
					const totalDocs = section.documents.length
					const completedDocs = section.documents.filter(
						(doc) =>
							getDocumentStatus(
								sectionKey,
								doc.name,
								section.documentType as "vehicle" | "procedure" | "environmental" | "company"
							).isUploaded
					).length
					const requiredPending = section.documents.filter(
						(doc) =>
							!getDocumentStatus(
								sectionKey,
								doc.name,
								section.documentType as "vehicle" | "procedure" | "environmental" | "company"
							).isUploaded &&
							getDocumentStatus(
								sectionKey,
								doc.name,
								section.documentType as "vehicle" | "procedure" | "environmental" | "company"
							).isRequired
					).length

					const progressPercentage =
						totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

					return (
						<AccordionItem
							key={sectionKey}
							value={sectionKey}
							className="bg-background mb-4 rounded-md border border-solid px-4"
						>
							<AccordionTrigger className="cursor-pointer items-center py-4 hover:no-underline">
								<div className="flex w-full items-center justify-between pr-4">
									<div className="flex items-center">
										<div
											className={cn(
												"mr-3 flex h-8 w-8 items-center justify-center rounded-full",
												completedDocs === totalDocs
													? "bg-green-500/10 text-green-500"
													: requiredPending > 0
														? "bg-red-500/10 text-red-500"
														: "bg-amber-500/10 text-amber-500"
											)}
										>
											{completedDocs === totalDocs ? (
												<CheckCircle2 className="h-5 w-5" />
											) : requiredPending > 0 ? (
												<AlertCircle className="h-5 w-5" />
											) : (
												<FileText className="h-5 w-5" />
											)}
										</div>
										<div className="flex flex-col items-start gap-1">
											<div className="flex items-center gap-1">
												<h3 className="text-left font-medium">{section.title}</h3>

												{SECTION_DESCRIPTIONS[sectionKey as keyof typeof SECTION_DESCRIPTIONS] && (
													<Tooltip>
														<TooltipTrigger asChild className="mt-0.5">
															<div>
																<Info className="text-muted-foreground h-4 w-4 cursor-help" />
															</div>
														</TooltipTrigger>
														<TooltipContent side="right" className="max-w-sm">
															{
																SECTION_DESCRIPTIONS[
																	sectionKey as keyof typeof SECTION_DESCRIPTIONS
																]
															}
														</TooltipContent>
													</Tooltip>
												)}
											</div>
											<p className="text-muted-foreground text-left text-sm">
												{completedDocs} de {totalDocs} documentos • {progressPercentage}% completado
											</p>
										</div>
									</div>

									<div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
										<div
											className={cn(
												"h-full",
												completedDocs === totalDocs
													? "bg-green-500"
													: requiredPending > 0
														? "bg-red-500"
														: "bg-amber-500"
											)}
											style={{ width: `${progressPercentage}%` }}
										></div>
									</div>
								</div>
							</AccordionTrigger>

							<AccordionContent>
								<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
									{section.documents.map((doc) => {
										const { isUploaded, isRequired, document } = getDocumentStatus(
											sectionKey,
											doc.name,
											section.documentType as "vehicle" | "procedure" | "environmental" | "company"
										)

										return (
											<div
												key={doc.name}
												className={cn(
													"flex items-center justify-between rounded-md p-3",
													isUploaded
														? "bg-green-50 dark:bg-green-950/30"
														: isRequired
															? "bg-red-50 dark:bg-red-950/30"
															: "bg-amber-50 dark:bg-amber-950/30"
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

													<div className="flex flex-col items-start gap-1">
														<div className="flex items-center gap-1">
															<p className="font-medium">{doc.name}</p>
															{DOCUMENT_DESCRIPTIONS[
																doc.name as keyof typeof DOCUMENT_DESCRIPTIONS
															] && (
																<Tooltip>
																	<TooltipTrigger asChild className="mt-0.5">
																		<div>
																			<Info className="text-muted-foreground h-4 w-4 cursor-help" />
																		</div>
																	</TooltipTrigger>
																	<TooltipContent side="right" className="max-w-sm">
																		{
																			DOCUMENT_DESCRIPTIONS[
																				doc.name as keyof typeof DOCUMENT_DESCRIPTIONS
																			]
																		}
																	</TooltipContent>
																</Tooltip>
															)}
														</div>

														<p className="text-muted-foreground text-xs">
															{isRequired ? "Requerido" : "Opcional"}
														</p>
													</div>
												</div>

												<div>
													{isUploaded && document ? (
														<div className="flex gap-2">
															<Button asChild size="sm" variant="outline">
																<a href={document.url} target="_blank" rel="noreferrer noopener">
																	<ExternalLink className="mr-1 h-4 w-4" />
																	Ver
																</a>
															</Button>

															{isEditable && (
																<UploadStartupFolderDocumentForm
																	type={
																		section.documentType as
																			| "worker"
																			| "vehicle"
																			| "procedure"
																			| "environmental"
																			| "company"
																	}
																	isUpdate={true}
																	folderId={folder.id}
																	documentName={doc.name}
																	documentId={document.id}
																	currentUrl={document.url}
																	subcategory={section.subcategory}
																	documentType={"type" in doc ? doc.type : ""}
																/>
															)}
														</div>
													) : isEditable ? (
														<UploadStartupFolderDocumentForm
															type={
																section.documentType as
																	| "worker"
																	| "vehicle"
																	| "procedure"
																	| "environmental"
																	| "company"
															}
															isUpdate={false}
															folderId={folder.id}
															documentName={doc.name}
															subcategory={section.subcategory}
															documentType={"type" in doc ? doc.type : ""}
														/>
													) : (
														<span className="text-muted-foreground text-sm italic">Pendiente</span>
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
	)
}
