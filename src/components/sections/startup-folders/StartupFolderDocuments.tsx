"use client"

import { X, FileText, ExternalLink, CheckCircle2, Info, User, Car, AlertCircle } from "lucide-react"

import { StartupFolderWithDocuments } from "@/hooks/startup-folders/use-startup-folder"
import { cn } from "@/lib/utils"
import {
	ReviewStatus,
	WorkerDocument,
	CompanyDocument,
	VehicleDocument,
	DocumentCategory,
	ProcedureDocument,
	EnvironmentalDocument,
} from "@prisma/client"
import {
	WORKER_STRUCTURE,
	VEHICLE_STRUCTURE,
	StartupFolderStructure,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import { UploadStartupFolderDocumentForm } from "./UploadStartupFolderDocumentForm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion"

interface StartupFolderDocumentsProps {
	folder: StartupFolderWithDocuments
	isEditable: boolean
}

export function StartupFolderDocuments({ folder, isEditable }: StartupFolderDocumentsProps) {
	const getDocumentStatus = (sectionKey: DocumentCategory, documentName: string) => {
		let document:
			| CompanyDocument
			| VehicleDocument
			| WorkerDocument
			| EnvironmentalDocument
			| ProcedureDocument
			| null = null
		let isRequired = false
		let description = ""
		let status: ReviewStatus = ReviewStatus.DRAFT

		// Determinar el tipo de documento y buscar por categoría
		switch (sectionKey) {
			case DocumentCategory.VEHICLES:
				// Buscar la definición del documento en la estructura de vehículos
				const vehicleDoc = VEHICLE_STRUCTURE.documents.find((doc) => doc.name === documentName)

				if (vehicleDoc) {
					isRequired = vehicleDoc.required
					description = vehicleDoc.description || "Documento de vehículo"

					// Buscar si existe el documento en los documentos del vehículo
					document =
						folder.vehiclesDocuments?.find((doc: VehicleDocument) => doc.name === documentName) ??
						null

					if (document) {
						status = document.status
					}
				}
				break

			case DocumentCategory.PERSONNEL:
				// Buscar la definición del documento en la estructura de trabajadores
				const workerDoc = WORKER_STRUCTURE.documents.find((doc) => doc.name === documentName)

				if (workerDoc) {
					isRequired = workerDoc.required
					description = workerDoc.description || "Documento de trabajador"

					// Buscar si existe el documento en los documentos del trabajador
					document =
						folder.workersDocuments?.find((doc: WorkerDocument) =>
							doc.name.includes(documentName)
						) ?? null

					if (document) {
						status = document.status
					}
				}
				break

			case DocumentCategory.ENVIRONMENTAL:
				// Buscar la definición del documento en la estructura ambiental
				const envDoc = ENVIRONMENTAL_STRUCTURE.documents.find((doc) => doc.name === documentName)

				if (envDoc) {
					isRequired = envDoc.required
					description = envDoc.description || "Documento ambiental"

					// Buscar si existe el documento en los documentos ambientales
					document =
						folder.environmentalsDocuments?.find(
							(doc: EnvironmentalDocument) => doc.name === documentName
						) ?? null

					if (document) {
						status = document.status
					}
				}
				break

			case DocumentCategory.SAFETY_AND_HEALTH:
				const safetyDoc = SAFETY_AND_HEALTH_STRUCTURE.documents.find(
					(doc) => doc.name === documentName
				)

				if (safetyDoc) {
					isRequired = safetyDoc.required
					description = safetyDoc.description || "Documento de seguridad y salud"

					// Verificar si es un documento de procedimiento
					if (
						[
							"Procedimiento de Trabajo",
							"Procedimiento de Emergencia",
							"Procedimiento de Acoso Laboral, Sexual y Violencia en el Trabajo",
						].includes(documentName)
					) {
						// Buscar en procedimientos
						document =
							folder.proceduresDocuments?.find(
								(doc: ProcedureDocument) => doc.name === documentName
							) ?? null
					} else {
						// Buscar en documentos de empresa por categoría
						document =
							folder.companyDocuments?.find(
								(doc: CompanyDocument) =>
									doc.name === documentName && doc.category === DocumentCategory.SAFETY_AND_HEALTH
							) ?? null
					}

					if (document) {
						status = document.status
					}
				}
				break

			default:
				// Caso no manejado
				break
		}

		// Verificamos si el documento está subido
		const isUploaded = !!document && document.url !== ""

		return {
			document,
			isUploaded,
			isRequired,
			description,
			status,
		}
	}

	const renderVehiclesSection = () => {
		// Si no hay documentos de vehículos, no mostramos la sección
		if (!folder.vehiclesDocuments || folder.vehiclesDocuments.length === 0) {
			return null
		}

		// Calculamos el progreso de la sección
		const totalDocs = VEHICLE_STRUCTURE.documents.length
		const completedDocs = VEHICLE_STRUCTURE.documents.filter(
			(doc: StartupFolderStructure["documents"][number]) =>
				folder.vehiclesDocuments?.some((vDoc: VehicleDocument) => vDoc.name.includes(doc.name))
		).length
		const progressPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

		return (
			<AccordionItem
				value="vehicles"
				className="bg-background mb-4 rounded-md border border-solid px-4"
			>
				<AccordionTrigger className="cursor-pointer items-center py-4 hover:no-underline">
					<div className="flex w-full items-center justify-between pr-4">
						<div className="flex items-center">
							<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
								<Car className="h-5 w-5" />
							</div>
							<div className="flex flex-col items-start">
								<div className="flex items-center gap-0.5">
									<h3 className="mr-1 text-left font-medium">{VEHICLE_STRUCTURE.title}</h3>
									<Tooltip delayDuration={200}>
										<TooltipTrigger className="mt-0.5 flex items-center">
											<Info className="text-muted-foreground h-4 w-4 cursor-help" />
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs text-balance">{VEHICLE_STRUCTURE.description}</p>
										</TooltipContent>
									</Tooltip>
								</div>
								<p className="text-muted-foreground text-left text-sm">
									Documentos de {folder.vehiclesDocuments.length} vehículos
								</p>
							</div>
						</div>
						<Progress value={progressPercentage} className="w-24" />
					</div>
				</AccordionTrigger>

				<AccordionContent>
					<div className="space-y-3 py-2">
						{/* Agrupados por vehículo */}
						{folder.vehiclesDocuments.map((vehicleDoc: VehicleDocument) => {
							// Extraer el nombre del vehículo (normalmente después del guión)
							const vehicleName = vehicleDoc.name.split(" - ")[1] || "Vehículo"
							// Extraer el tipo de documento (antes del guión)
							const docType = vehicleDoc.name.split(" - ")[0]

							return (
								<div
									key={vehicleDoc.id}
									className="flex items-center justify-between rounded-md bg-green-500/10 p-3"
								>
									<div className="flex items-center">
										<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-500">
											<CheckCircle2 className="h-5 w-5" />
										</div>
										<div className="flex flex-col items-start">
											<p className="font-medium">{docType}</p>
											<p className="text-muted-foreground text-xs">{vehicleName}</p>
										</div>
									</div>
									<Button asChild size="sm" variant="outline">
										<a href={vehicleDoc.url} target="_blank" rel="noreferrer noopener">
											<ExternalLink className="mr-1 h-4 w-4" />
											Ver
										</a>
									</Button>
								</div>
							)
						})}
					</div>
				</AccordionContent>
			</AccordionItem>
		)
	}

	const renderWorkersSection = () => {
		// Si no hay documentos de trabajadores, no mostramos la sección
		if (!folder.workersDocuments || folder.workersDocuments.length === 0) {
			return null
		}

		// Información para la sección de trabajadores
		const workerTitle = WORKER_STRUCTURE.title || "Documentos de Trabajadores"

		// Agrupar documentos por trabajador
		const workerMap = new Map<string, { id: string; name: string; documents: WorkerDocument[] }>()

		// Recorrer todos los documentos buscando patrones como "Documento - Nombre"
		folder.workersDocuments.forEach((doc: WorkerDocument) => {
			const parts = doc.name.split(" - ")
			if (parts.length >= 2) {
				// El tipo de documento está en la primera parte
				const workerName = parts[1]

				// Usar el nombre del trabajador como identificador único
				if (!workerMap.has(workerName)) {
					workerMap.set(workerName, {
						id: workerName,
						name: workerName,
						documents: [],
					})
				}

				// Agregar documento al trabajador
				workerMap.get(workerName)?.documents.push(doc)
			}
		})

		// Convertir el mapa a un array
		const workers = Array.from(workerMap.values())

		return (
			<AccordionItem
				value="workers"
				className="bg-background border-input mb-4 rounded-md border px-4"
			>
				<AccordionTrigger className="cursor-pointer items-center py-4 hover:no-underline">
					<div className="flex w-full items-center justify-between pr-4">
						<div className="flex items-center">
							<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
								<User className="h-5 w-5" />
							</div>
							<div className="flex flex-col items-start">
								<div className="flex items-center gap-0.5">
									<h3 className="mr-1 text-left font-medium">{workerTitle}</h3>
									<Tooltip delayDuration={200}>
										<TooltipTrigger className="mt-0.5 flex items-center">
											<Info className="text-muted-foreground h-4 w-4 cursor-help" />
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs text-balance">{WORKER_STRUCTURE.description}</p>
										</TooltipContent>
									</Tooltip>
								</div>
								<p className="text-muted-foreground text-left text-sm">
									{workers.length} trabajadores con documentación
								</p>
							</div>
						</div>
					</div>
				</AccordionTrigger>

				<AccordionContent>
					<div className="space-y-6">
						{/* Mostrar un Accordion para cada trabajador */}
						<Accordion type="multiple" className="space-y-2">
							{workers.map((worker) => (
								<AccordionItem
									key={worker.id}
									value={worker.id}
									className="border-muted overflow-hidden rounded-md border"
								>
									<AccordionTrigger className="px-4 py-2 hover:bg-gray-50 hover:no-underline dark:hover:bg-gray-800">
										<div className="flex items-center">
											<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
												<User className="h-4 w-4" />
											</div>
											<span className="font-medium">{worker.name}</span>
											<span className="text-muted-foreground ml-2 text-sm">
												({worker.documents.length} documentos)
											</span>
										</div>
									</AccordionTrigger>

									<AccordionContent className="px-4 pt-0 pb-2">
										<div className="grid gap-3 pt-2">
											{worker.documents.map((doc) => {
												const isUploaded = doc.url !== ""
												const docType = doc.name.split(" - ")[0]
												const description =
													WORKER_STRUCTURE.documents.find((doc) => doc.name === docType)
														?.description || ""

												return (
													<div
														key={doc.id}
														className={cn(
															"flex items-center justify-between rounded-md p-3",
															isUploaded ? "bg-green-500/10" : "bg-red-500/10"
														)}
													>
														<div className="flex items-center">
															<div
																className={cn(
																	"mr-3 flex h-8 w-8 items-center justify-center rounded-full",
																	isUploaded
																		? "bg-green-500/10 text-green-500"
																		: "bg-red-500/10 text-red-500"
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
																	<p className="font-medium">{docType}</p>
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
															</div>
														</div>

														{isUploaded ? (
															<Button asChild size="sm" variant="outline">
																<a href={doc.url} target="_blank" rel="noreferrer noopener">
																	<ExternalLink className="mr-1 h-4 w-4" />
																	Ver
																</a>
															</Button>
														) : isEditable ? (
															<UploadStartupFolderDocumentForm
																type={doc.type}
																isUpdate={false}
																folderId={folder.id}
																documentName={doc.name}
																category={SAFETY_AND_HEALTH_STRUCTURE.category}
															/>
														) : (
															<span className="text-muted-foreground text-sm italic">
																Pendiente
															</span>
														)}
													</div>
												)
											})}
										</div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</AccordionContent>
			</AccordionItem>
		)
	}

	const renderSafetyAndHealthSection = () => {
		const totalDocs = SAFETY_AND_HEALTH_STRUCTURE.documents.length
		const completedDocs = SAFETY_AND_HEALTH_STRUCTURE.documents.filter(
			(doc: StartupFolderStructure["documents"][number]) =>
				getDocumentStatus(DocumentCategory.SAFETY_AND_HEALTH, doc.name).isUploaded
		).length
		const requiredPending = SAFETY_AND_HEALTH_STRUCTURE.documents.filter(
			(doc: StartupFolderStructure["documents"][number]) =>
				!getDocumentStatus(DocumentCategory.SAFETY_AND_HEALTH, doc.name).isUploaded &&
				getDocumentStatus(DocumentCategory.SAFETY_AND_HEALTH, doc.name).isRequired
		).length

		const progressPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

		const sectionDescription = SAFETY_AND_HEALTH_STRUCTURE.description

		return (
			<AccordionItem
				key={SAFETY_AND_HEALTH_STRUCTURE.title}
				value={SAFETY_AND_HEALTH_STRUCTURE.title}
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
									<h3 className="mr-1 text-left font-medium">
										{SAFETY_AND_HEALTH_STRUCTURE.title}
									</h3>
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
						{ENVIRONMENTAL_STRUCTURE.documents.map(
							(doc: StartupFolderStructure["documents"][number]) => {
								const { document, isUploaded, isRequired, description } = getDocumentStatus(
									ENVIRONMENTAL_STRUCTURE.category,
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
															type={doc.type}
															isUpdate={true}
															folderId={folder.id}
															documentName={doc.name}
															documentId={document.id}
															currentUrl={document.url}
															category={SAFETY_AND_HEALTH_STRUCTURE.category}
														/>
													)}
												</div>
											) : isEditable ? (
												<UploadStartupFolderDocumentForm
													type={doc.type}
													isUpdate={false}
													folderId={folder.id}
													documentName={doc.name}
													category={SAFETY_AND_HEALTH_STRUCTURE.category}
												/>
											) : (
												<span className="text-muted-foreground text-sm italic">Pendiente</span>
											)}
										</div>
									</div>
								)
							}
						)}
					</div>
				</AccordionContent>
			</AccordionItem>
		)
	}

	const renderEnvironmentalSection = () => {
		const totalDocs = ENVIRONMENTAL_STRUCTURE.documents.length
		const completedDocs = ENVIRONMENTAL_STRUCTURE.documents.filter(
			(doc: StartupFolderStructure["documents"][number]) =>
				getDocumentStatus(DocumentCategory.ENVIRONMENTAL, doc.name).isUploaded
		).length
		const requiredPending = ENVIRONMENTAL_STRUCTURE.documents.filter(
			(doc: StartupFolderStructure["documents"][number]) =>
				!getDocumentStatus(DocumentCategory.ENVIRONMENTAL, doc.name).isUploaded &&
				getDocumentStatus(DocumentCategory.ENVIRONMENTAL, doc.name).isRequired
		).length

		const progressPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

		return (
			<AccordionItem
				key={ENVIRONMENTAL_STRUCTURE.title}
				value={ENVIRONMENTAL_STRUCTURE.title}
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
									<h3 className="mr-1 text-left font-medium">{ENVIRONMENTAL_STRUCTURE.title}</h3>
									<Tooltip delayDuration={200}>
										<TooltipTrigger className="mt-0.5 flex items-center">
											<Info className="text-muted-foreground h-4 w-4 cursor-help" />
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs text-balance">{ENVIRONMENTAL_STRUCTURE.description}</p>
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
						{ENVIRONMENTAL_STRUCTURE.documents.map(
							(doc: StartupFolderStructure["documents"][number]) => {
								const { document, isUploaded, isRequired, description } = getDocumentStatus(
									DocumentCategory.ENVIRONMENTAL,
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
															isUpdate={true}
															type={doc.type}
															folderId={folder.id}
															documentName={doc.name}
															documentId={document.id}
															currentUrl={document.url}
															category={ENVIRONMENTAL_STRUCTURE.category}
														/>
													)}
												</div>
											) : isEditable ? (
												<UploadStartupFolderDocumentForm
													type={doc.type}
													isUpdate={false}
													folderId={folder.id}
													documentName={doc.name}
													category={ENVIRONMENTAL_STRUCTURE.category}
												/>
											) : (
												<span className="text-muted-foreground text-sm italic">Pendiente</span>
											)}
										</div>
									</div>
								)
							}
						)}
					</div>
				</AccordionContent>
			</AccordionItem>
		)
	}

	return (
		<div className="space-y-6">
			<Accordion type="multiple">
				{renderSafetyAndHealthSection()}
				{renderEnvironmentalSection()}
				{renderVehiclesSection()}
				{renderWorkersSection()}
			</Accordion>
		</div>
	)
}
