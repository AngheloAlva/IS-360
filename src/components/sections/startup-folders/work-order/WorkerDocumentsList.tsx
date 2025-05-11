"use client"

import { CheckCircle2, X, ExternalLink, AlertCircle, Info, UserIcon } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

import { WorkOrderStartupFolderWithDocuments } from "@/hooks/startup-folders/use-work-order-startup-folder"
import { DOCUMENT_DESCRIPTIONS } from "./WorkOrderDocumentDescriptions"
import { cn } from "@/lib/utils"

import { UploadStartupFolderDocumentForm } from "../UploadStartupFolderDocumentForm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AddWorkerForm } from "./AddWorkerForm"
import { Button } from "@/components/ui/button"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion"

interface WorkerDocumentsListProps {
	folder: WorkOrderStartupFolderWithDocuments
	isEditable: boolean
}

interface WorkerInfo {
	id: string
	name: string
	rut: string
}

export function WorkerDocumentsList({ folder, isEditable }: WorkerDocumentsListProps) {
	const router = useRouter()
	const [workers, setWorkers] = useState<WorkerInfo[]>([])
	const [activeTab, setActiveTab] = useState<string | null>(null)

	// Función para agrupar documentos por trabajador, memoizada con useCallback
	const groupDocumentsByWorker = useCallback(() => {
		const workerMap = new Map<string, WorkerInfo>()
		const workerDocuments = folder.workers || []

		// Recorrer todos los documentos buscando patrones como "Documento - Nombre (RUT)"
		workerDocuments.forEach((doc) => {
			const match = doc.name.match(/(.+) - (.+) \((.+)\)$/)
			if (match) {
				const [, , workerName, workerRut] = match
				// Usar el patrón "nombre (rut)" como identificador único
				const workerId = `${workerName} (${workerRut})`

				if (!workerMap.has(workerId)) {
					workerMap.set(workerId, {
						id: workerId,
						name: workerName,
						rut: workerRut,
					})
				}
			}
		})

		return Array.from(workerMap.values())
	}, [folder.workers])

	// Obtener documentos de un trabajador específico
	const getWorkerDocuments = (workerId: string) => {
		return (folder.workers || []).filter((doc) => doc.name.includes(workerId))
	}

	// Inicializar la lista de trabajadores y seleccionar el primer tab
	useEffect(() => {
		const workersList = groupDocumentsByWorker()
		setWorkers(workersList)

		if (workersList.length > 0 && !activeTab) {
			setActiveTab(workersList[0].id)
		}
	}, [folder.workers, activeTab, groupDocumentsByWorker])

	// Refrescar la página cuando se agrega un nuevo trabajador
	const handleWorkerAdded = () => {
		router.refresh()
	}

	return (
		<div className="mb-8 space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">Documentación por trabajador</h2>

				{isEditable && (
					<AddWorkerForm
						workOrderId={folder.workOrderId}
						folderId={folder.id}
						onWorkerAdded={handleWorkerAdded}
					/>
				)}
			</div>

			{workers.length === 0 ? (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>No hay trabajadores registrados</AlertTitle>
					<AlertDescription>
						Aún no se han agregado trabajadores a esta orden de trabajo.
						{isEditable ? " Usa el botón 'Agregar trabajador' para comenzar." : ""}
					</AlertDescription>
				</Alert>
			) : (
				<Accordion type="multiple">
					{workers.map((worker) => {
						return (
							<AccordionItem
								key={worker.id}
								value={worker.id}
								className="bg-background mb-4 rounded-md border border-solid px-4"
							>
								<AccordionTrigger
									key={worker.id}
									value={worker.id}
									className="cursor-pointer items-center py-4 hover:no-underline"
								>
									<div className="flex w-full items-center justify-between pr-4">
										<div className="flex items-center">
											<div className="bg-primary/10 text-primary mr-3 flex h-8 w-8 items-center justify-center rounded-full">
												<UserIcon className="h-5 w-5" />
											</div>

											<div className="flex items-center gap-1">
												<h3 className="text-left font-medium">{worker.name}</h3>
												{/* <p className="text-muted-foreground ml-2 text-left text-sm">
													{completedDocs} de {totalDocs} documentos • {progressPercentage}%
													completado
												</p> */}
											</div>
										</div>
									</div>
								</AccordionTrigger>

								<AccordionContent>
									<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
										{getWorkerDocuments(worker.id).map((doc) => {
											const isUploaded = doc.url !== ""
											const originalName = doc.name.split(" - ")[0]

											return (
												<div
													key={doc.id}
													className={cn(
														"flex items-center justify-between rounded-md p-3",
														isUploaded
															? "bg-green-50 dark:bg-green-950/30"
															: "bg-red-50 dark:bg-red-950/30"
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

														<div className="flex items-center gap-1">
															<p className="font-medium">{originalName}</p>

															{DOCUMENT_DESCRIPTIONS[
																originalName as keyof typeof DOCUMENT_DESCRIPTIONS
															] && (
																<Tooltip>
																	<TooltipTrigger asChild>
																		<div>
																			<Info className="text-muted-foreground h-4 w-4 cursor-help" />
																		</div>
																	</TooltipTrigger>
																	<TooltipContent side="right" className="max-w-sm">
																		{
																			DOCUMENT_DESCRIPTIONS[
																				originalName as keyof typeof DOCUMENT_DESCRIPTIONS
																			]
																		}
																	</TooltipContent>
																</Tooltip>
															)}
														</div>
													</div>

													<div>
														{isUploaded ? (
															<div className="flex gap-2">
																<Button asChild size="sm" variant="outline">
																	<a href={doc.url} target="_blank" rel="noreferrer noopener">
																		<ExternalLink className="mr-1 h-4 w-4" />
																		Ver
																	</a>
																</Button>

																{isEditable && (
																	<UploadStartupFolderDocumentForm
																		type="worker"
																		isUpdate={true}
																		documentId={doc.id}
																		currentUrl={doc.url}
																		folderId={folder.id}
																		documentName={doc.name}
																		documentType={doc.type}
																		subcategory={doc.subcategory}
																	/>
																)}
															</div>
														) : isEditable ? (
															<UploadStartupFolderDocumentForm
																type="worker"
																isUpdate={false}
																folderId={folder.id}
																documentName={doc.name}
																documentType={doc.type}
																subcategory={doc.subcategory}
															/>
														) : (
															<span className="text-muted-foreground text-sm italic">
																Pendiente
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
			)}
		</div>
	)
}
