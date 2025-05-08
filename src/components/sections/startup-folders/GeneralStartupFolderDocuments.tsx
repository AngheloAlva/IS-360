"use client"

import { GeneralStartupFolderWithDocuments } from "@/hooks/startup-folders/use-general-startup-folder"
import { Button } from "@/components/ui/button"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { X, FileText, AlertCircle, ExternalLink, CheckCircle2 } from "lucide-react"
import { GENERAL_STARTUP_FOLDER_STRUCTURE } from "@/lib/consts/startup-folders"
import { cn } from "@/lib/utils"
import { UploadStartupFolderDocumentForm } from "./UploadStartupFolderDocumentForm"

interface GeneralStartupFolderDocumentsProps {
	folder: GeneralStartupFolderWithDocuments
	isEditable: boolean
}

export function GeneralStartupFolderDocuments({
	folder,
	isEditable,
}: GeneralStartupFolderDocumentsProps) {
	// Organizar documentos por sección
	const getDocumentStatus = (sectionKey: string, documentName: string) => {
		const document = folder.documents.find((doc) => doc.name === documentName)

		return {
			document,
			isUploaded: !!document && document.url !== "",
			isRequired:
				GENERAL_STARTUP_FOLDER_STRUCTURE[
					sectionKey as keyof typeof GENERAL_STARTUP_FOLDER_STRUCTURE
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

			<Accordion type="multiple" defaultValue={Object.keys(GENERAL_STARTUP_FOLDER_STRUCTURE)}>
				{Object.entries(GENERAL_STARTUP_FOLDER_STRUCTURE).map(([sectionKey, section]) => {
					// Calcular el progreso de la sección
					const totalDocs = section.documents.length
					const completedDocs = section.documents.filter(
						(doc) => getDocumentStatus(sectionKey, doc.name).isUploaded
					).length
					const requiredPending = section.documents.filter(
						(doc) =>
							!getDocumentStatus(sectionKey, doc.name).isUploaded &&
							getDocumentStatus(sectionKey, doc.name).isRequired
					).length

					const progressPercentage =
						totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

					return (
						<AccordionItem
							key={sectionKey}
							value={sectionKey}
							className="mb-4 rounded-md border border-solid px-4"
						>
							<AccordionTrigger className="py-4 hover:no-underline">
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
										<div>
											<h3 className="text-left font-medium">{section.title}</h3>
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
								<div className="space-y-3 py-2">
									{section.documents.map((doc) => {
										const { document, isUploaded, isRequired } = getDocumentStatus(
											sectionKey,
											doc.name
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

													<div>
														<p className="font-medium">{doc.name}</p>
														<p className="text-muted-foreground text-xs">
															{isRequired ? "Requerido" : "Opcional"}
															{document?.uploadedAt &&
																` • Subido: ${new Date(document.uploadedAt).toLocaleDateString()}`}
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
																	type="company"
																	documentId={document.id}
																	folderId={folder.id}
																	documentName={doc.name}
																	documentType={doc.type}
																	currentUrl={document.url}
																	isUpdate={true}
																/>
															)}
														</div>
													) : isEditable ? (
														<UploadStartupFolderDocumentForm
															type="company"
															folderId={folder.id}
															documentName={doc.name}
															documentType={doc.type}
															isUpdate={false}
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
