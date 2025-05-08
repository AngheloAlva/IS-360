"use client"

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { WorkOrderStartupFolderWithDocuments } from "@/hooks/startup-folders/use-work-order-startup-folder"
import { WORK_ORDER_STARTUP_FOLDER_STRUCTURE } from "@/lib/consts/startup-folders"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardTitle,
	CardFooter,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/components/ui/card"

interface WorkOrderStartupFolderSubmitFormProps {
	folder: WorkOrderStartupFolderWithDocuments
}

export function WorkOrderStartupFolderSubmitForm({
	folder,
}: WorkOrderStartupFolderSubmitFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const queryClient = useQueryClient()

	// Función para obtener los documentos según el tipo
	const getDocumentsByType = (type: string) => {
		switch (type) {
			case "worker":
				return folder.workers || []
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

	// Verificamos documentos requeridos
	const missingRequiredDocuments: { section: string; name: string }[] = []

	// Recorrer todas las secciones y documentos para verificar que todos los documentos requeridos estén cargados
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Object.entries(WORK_ORDER_STARTUP_FOLDER_STRUCTURE).forEach(([sectionKey, section]) => {
		section.documents.forEach((doc) => {
			if (doc.required) {
				// Buscar si el documento existe y tiene URL
				const documents = getDocumentsByType(section.documentType)
				const documentExists = documents.some(
					(uploadedDoc) => uploadedDoc.name === doc.name && uploadedDoc.url !== ""
				)

				if (!documentExists) {
					missingRequiredDocuments.push({
						section: section.title,
						name: doc.name,
					})
				}
			}
		})
	})

	// Función para enviar la carpeta a revisión
	async function onSubmit() {
		setIsSubmitting(true)

		try {
			const response = await fetch(`/api/startup-folders/work-order/submit`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					folderId: folder.id,
				}),
			})

			if (!response.ok) {
				throw new Error("Error al enviar la carpeta para revisión")
			}

			// Mostrar mensaje de éxito
			toast.error("Carpeta enviada para revisión", {
				description: "Un responsable de OTC revisará tu carpeta y te notificará cuando esté lista",
			})

			// Refrescar los datos
			queryClient.invalidateQueries({
				queryKey: ["workOrderStartupFolder", folder.id],
			})

			// Redireccionar a la pestaña de documentos
			router.push(`/dashboard/carpetas-de-arranque/orden/${folder.id}?tab=documentos`)
		} catch (error) {
			console.error(error)
			toast.error("Error al enviar la carpeta para revisión")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Enviar carpeta para revisión</CardTitle>
				<CardDescription>
					Antes de enviar la carpeta, asegúrate de que todos los documentos requeridos estén
					cargados
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div
						className={cn(
							"rounded-md p-4",
							missingRequiredDocuments.length > 0
								? "bg-red-50 dark:bg-red-950/30"
								: "bg-green-50 dark:bg-green-950/30"
						)}
					>
						<div className="flex items-center">
							{missingRequiredDocuments.length > 0 ? (
								<AlertCircle className="mr-2 h-5 w-5 text-red-500" />
							) : (
								<CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
							)}
							<h3
								className={cn(
									"font-medium",
									missingRequiredDocuments.length > 0
										? "text-red-700 dark:text-red-300"
										: "text-green-700 dark:text-green-300"
								)}
							>
								{missingRequiredDocuments.length > 0
									? "Faltan documentos requeridos"
									: "Todos los documentos requeridos están cargados"}
							</h3>
						</div>

						{missingRequiredDocuments.length > 0 && (
							<div className="mt-2 pl-7">
								<p className="mb-1 text-sm text-red-600 dark:text-red-400">
									Por favor, carga los siguientes documentos requeridos:
								</p>
								<ul className="text-sm text-red-600 dark:text-red-400">
									{missingRequiredDocuments.map((doc, index) => (
										<li key={index} className="mb-1">
											<span className="font-medium">{doc.section}:</span> {doc.name}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					<div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/30">
						<div className="flex">
							<AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
							<div>
								<h3 className="font-medium text-amber-700 dark:text-amber-300">Importante</h3>
								<p className="text-sm text-amber-600 dark:text-amber-400">
									Una vez que envíes la carpeta para revisión, no podrás modificar los documentos
									hasta que sea aprobada o rechazada por OTC.
								</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex justify-end">
				<Button onClick={onSubmit} disabled={missingRequiredDocuments.length > 0 || isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					<Send className="mr-2 h-4 w-4" />
					{folder.status === "REJECTED" ? "Volver a enviar para revisión" : "Enviar para revisión"}
				</Button>
			</CardFooter>
		</Card>
	)
}
