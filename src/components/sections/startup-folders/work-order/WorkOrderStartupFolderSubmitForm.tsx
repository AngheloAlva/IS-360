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
	AlertDialog,
	AlertDialogTitle,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/components/ui/alert-dialog"

interface WorkOrderStartupFolderSubmitFormProps {
	folder: WorkOrderStartupFolderWithDocuments
}

export function WorkOrderStartupFolderSubmitForm({
	folder,
}: WorkOrderStartupFolderSubmitFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const queryClient = useQueryClient()

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

	const missingRequiredDocuments: { section: string; name: string }[] = []

	Object.entries(WORK_ORDER_STARTUP_FOLDER_STRUCTURE).forEach(([, section]) => {
		section.documents.forEach((doc) => {
			if (doc.required) {
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

			toast.error("Carpeta enviada para revisión", {
				description: "Un responsable de OTC revisará tu carpeta y te notificará cuando esté lista",
			})

			queryClient.invalidateQueries({
				queryKey: ["workOrderStartupFolder", folder.id],
			})

			router.push(`/dashboard/carpetas-de-arranque/orden/${folder.id}?tab=documentos`)
		} catch (error) {
			console.error(error)
			toast.error("Error al enviar la carpeta para revisión")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button>
					<Send className="mr-2 h-4 w-4" />
					{folder.status === "REJECTED" ? "Volver a enviar para revisión" : "Enviar para revisión"}
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Enviar carpeta para revisión</AlertDialogTitle>
					<AlertDialogDescription>
						Antes de enviar la carpeta, asegúrate de que todos los documentos requeridos estén
						cargados
					</AlertDialogDescription>
				</AlertDialogHeader>

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
								<AlertCircle className="mr-2 h-4 min-h-4 min-w-4 text-red-500" />
							) : (
								<CheckCircle2 className="mr-2 h-4 min-h-4 min-w-4 text-green-500" />
							)}
							<h3
								className={cn(
									"font-medium",
									missingRequiredDocuments.length > 0
										? "text-red-700 dark:text-red-500"
										: "text-green-700 dark:text-green-500"
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
							<AlertCircle className="mt-1 mr-2 h-4 min-h-4 min-w-4 text-amber-500" />
							<div>
								<h3 className="font-medium text-amber-700 dark:text-amber-500">Importante</h3>
								<p className="text-sm text-amber-600 dark:text-amber-400">
									Una vez que envíes la carpeta para revisión, no podrás modificar los documentos
									hasta que sea aprobada o rechazada por OTC.
								</p>
							</div>
						</div>
					</div>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={onSubmit}
						disabled={missingRequiredDocuments.length > 0 || isSubmitting}
					>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Confirmar
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
