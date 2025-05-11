"use client"

import { X, FileText, AlertCircle, ExternalLink, CheckCircle2, Info } from "lucide-react"

import { GeneralStartupFolderWithDocuments } from "@/hooks/startup-folders/use-general-startup-folder"
import { GENERAL_STARTUP_FOLDER_STRUCTURE } from "@/lib/consts/startup-folders"
import { cn } from "@/lib/utils"

import { UploadStartupFolderDocumentForm } from "../UploadStartupFolderDocumentForm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion"

interface GeneralStartupFolderDocumentsProps {
	folder: GeneralStartupFolderWithDocuments
	isEditable: boolean
}

const SECTION_DESCRIPTIONS = {
	basicInfo: "Información básica requerida de la empresa como ficha, nómina, carta Gantt, etc.",
	procedures: "Procedimientos y documentos relacionados con la seguridad y prevención de riesgos.",
	environmental: "Documentación relacionada con gestión ambiental y manejo de residuos.",
}

const DOCUMENT_DESCRIPTIONS = {
	// Información Básica
	"Ficha empresa":
		"Archivo que debe contener Nombre y Rut de la empresa, dirección, datos del representante legal y responsables.",
	"Nómina de personal":
		"Lista de trabajadores con nombres completos, Rut, cargo, contactos de emergencia y vigencia de exámenes médicos.",
	"Carta Gantt del proyecto y planificación":
		"Cronograma detallado del proyecto con sus etapas y plazos.",
	"Certificado de adhesión a mutualidad":
		"Comprobante oficial de afiliación a una mutualidad de seguridad.",
	"Reglamento interno de orden, higiene y seguridad":
		"Reglamento actualizado según DS 44 y ley Karin, con comprobante de presentación a la Dirección del Trabajo.",
	"Certificado de siniestralidad de mutualidad (1 año)":
		"Certificado que muestra la tasa de siniestralidad laboral del último año.",

	// Procedimientos y Otros
	"Matriz de Identificación de peligros y evaluación de Riesgos":
		"Documento que identifica los peligros y evalúa los riesgos asociados a las actividades en OTC.",
	"Plan de Prevención de riesgos":
		"Plan detallado de medidas preventivas concordante con la matriz de riesgos.",
	"Procedimiento de trabajos a ejecutar":
		"Procedimientos específicos para trabajos que se realizarán en OTC, con antigüedad no mayor a un año.",
	"Procedimientos de Emergencia y Acciones Por Seguir ante un Incidente":
		"Protocolos a seguir en caso de emergencias, incidentes o accidentes.",
	"Programa de Mantención de Herramientas y Equipos":
		"Plan de mantenimiento preventivo y correctivo para herramientas y equipos.",
	"Certificación de elementos de Protección Personal":
		"Certificados que garantizan la calidad y seguridad de los EPP utilizados.",
	"Procedimiento de Acoso Laboral, Sexual y Violencia en el Trabajo":
		"Procedimiento según Ley N°21.643 (Ley Karin) con detalles del proceso de denuncia e investigación.",
	"Organigrama de la Empresa": "Estructura jerárquica y organizacional de la empresa.",

	// Medio Ambiente
	"Plan de Gestión ambiental para trabajos en OTC":
		"Plan que detalla las medidas para protección del medio ambiente durante trabajos en OTC.",
	"Procedimiento de Prevención y control de derrames":
		"Protocolo para prevenir y controlar derrames de sustancias peligrosas.",
	"Procedimiento de manejo de residuos":
		"Procedimiento para gestión de residuos peligrosos, no peligrosos y domiciliarios.",
	"Programa de capacitación en materia ambiental":
		"Plan de entrenamiento del personal en temas ambientales.",
	"Matriz de identificación y evaluación de aspectos e impactos ambientales":
		"Documento que identifica aspectos ambientales y evalúa sus impactos.",
	"Certificado RECT en portales SIDREP y SINADER":
		"Certificado de registro en sistemas de declaración de residuos peligrosos y no peligrosos.",
	"Certificado compra de agua potable": "Comprobante de adquisición de agua potable, si aplica.",
	"Resolución sanitaria":
		"Documento oficial que autoriza el funcionamiento sanitario de instalaciones.",
}

export function GeneralStartupFolderDocuments({
	folder,
	isEditable,
}: GeneralStartupFolderDocumentsProps) {
	const getDocumentStatus = (sectionKey: string, documentName: string) => {
		const document = folder.documents.find((doc) => doc.name === documentName)

		const docDefinition = GENERAL_STARTUP_FOLDER_STRUCTURE[
			sectionKey as keyof typeof GENERAL_STARTUP_FOLDER_STRUCTURE
		].documents.find((doc) => doc.name === documentName)

		return {
			document,
			isUploaded: !!document && document.url !== "",
			isRequired: docDefinition?.required || false,
			subcategory:
				GENERAL_STARTUP_FOLDER_STRUCTURE[
					sectionKey as keyof typeof GENERAL_STARTUP_FOLDER_STRUCTURE
				].subcategory,
			description: DOCUMENT_DESCRIPTIONS[documentName as keyof typeof DOCUMENT_DESCRIPTIONS] || "",
		}
	}

	return (
		<div className="space-y-6">
			<Accordion type="multiple">
				{Object.entries(GENERAL_STARTUP_FOLDER_STRUCTURE).map(([sectionKey, section]) => {
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

					const sectionDescription =
						SECTION_DESCRIPTIONS[sectionKey as keyof typeof SECTION_DESCRIPTIONS]

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
										<div className="flex flex-col items-start">
											<div className="flex items-center gap-0.5">
												<h3 className="mr-1 text-left font-medium">{section.title}</h3>
												<Tooltip delayDuration={200}>
													<TooltipTrigger className="mt-0.5 flex items-center">
														<Info className="text-muted-foreground h-4 w-4 cursor-help" />
													</TooltipTrigger>
													<TooltipContent>
														<p className="max-w-xs text-balance">{sectionDescription}</p>
													</TooltipContent>
												</Tooltip>
											</div>

											<p className="text-muted-foreground text-left text-sm">
												{completedDocs} de {totalDocs} documentos • {progressPercentage}% completado
											</p>
										</div>
									</div>

									<Progress
										value={progressPercentage}
										className="w-24"
										indicatorClassName={cn({
											"bg-green-500/50": completedDocs === totalDocs,
											"bg-red-500/50": requiredPending > 0,
											"bg-amber-500/50": requiredPending === 0,
										})}
									/>
								</div>
							</AccordionTrigger>

							<AccordionContent>
								<div className="space-y-3 py-2">
									{section.documents.map((doc) => {
										const { document, isUploaded, isRequired, description } = getDocumentStatus(
											sectionKey,
											doc.name
										)

										return (
											<div
												key={doc.name}
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
															<p className="tezxt-left mr-1 font-medium">{doc.name}</p>
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

												<div className="flex gap-2">
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
																	isUpdate={true}
																	folderId={folder.id}
																	documentName={doc.name}
																	documentType={doc.type}
																	documentId={document.id}
																	currentUrl={document.url}
																	subcategory={section.subcategory}
																/>
															)}
														</div>
													) : isEditable ? (
														<UploadStartupFolderDocumentForm
															type="company"
															isUpdate={false}
															folderId={folder.id}
															documentName={doc.name}
															documentType={doc.type}
															subcategory={section.subcategory}
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
