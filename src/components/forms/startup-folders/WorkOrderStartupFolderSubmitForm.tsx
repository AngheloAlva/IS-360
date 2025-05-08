"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { SendIcon, AlertTriangle } from "lucide-react"

import { WorkOrderStartupFolderWithDocuments } from "@/hooks/startup-folders/use-work-order-startup-folder"
import { authClient } from "@/lib/auth-client"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { Separator } from "@/components/ui/separator"
import { WORK_ORDER_STARTUP_FOLDER_STRUCTURE } from "@/lib/consts/startup-folders"

// Schema para enviar la carpeta a revisión
const submitFormSchema = z.object({
	comments: z.string().optional(),
})

type SubmitFormSchema = z.infer<typeof submitFormSchema>

interface WorkOrderStartupFolderSubmitFormProps {
	folder: WorkOrderStartupFolderWithDocuments
}

export function WorkOrderStartupFolderSubmitForm({
	folder,
}: WorkOrderStartupFolderSubmitFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const { data: session } = authClient.useSession()

	const form = useForm<SubmitFormSchema>({
		resolver: zodResolver(submitFormSchema),
		defaultValues: {
			comments: "",
		},
	})

	// // Función para verificar si un documento es requerido
	// const isDocumentRequired = (sectionKey: string, documentName: string): boolean => {
	//   const section = WORK_ORDER_STARTUP_FOLDER_STRUCTURE[sectionKey as keyof typeof WORK_ORDER_STARTUP_FOLDER_STRUCTURE];
	//   if (!section) return false;

	//   const document = section.documents.find(doc => doc.name === documentName);
	//   return document?.required || false;
	// }

	// Verificar si hay documentos requeridos que faltan por subir
	const getMissingDocuments = () => {
		const missingDocs = []

		// Verificar documentos de trabajadores
		const workerDocs = folder.workers || []
		const workerDocNames = workerDocs.map((doc) => doc.name)
		const missingWorkerDocs = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.assignedPersonnel.documents
			.filter((doc) => doc.required && !workerDocNames.includes(doc.name))
			.map((doc) => doc.name)

		if (missingWorkerDocs.length > 0) {
			missingDocs.push(...missingWorkerDocs.map((name) => `Trabajadores: ${name}`))
		}

		// Verificar documentos de vehículos
		const vehicleDocs = folder.vehicles || []
		const vehicleDocNames = vehicleDocs.map((doc) => doc.name)
		const missingVehicleDocs = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.vehiclesAndEquipment.documents
			.filter((doc) => doc.required && !vehicleDocNames.includes(doc.name))
			.map((doc) => doc.name)

		if (missingVehicleDocs.length > 0) {
			missingDocs.push(...missingVehicleDocs.map((name) => `Vehículos: ${name}`))
		}

		// Verificar documentos de procedimientos
		const procedureDocs = folder.procedures || []
		const procedureDocNames = procedureDocs.map((doc) => doc.name)
		const missingProcedureDocs = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.specificProcedures.documents
			.filter((doc) => doc.required && !procedureDocNames.includes(doc.name))
			.map((doc) => doc.name)

		if (missingProcedureDocs.length > 0) {
			missingDocs.push(...missingProcedureDocs.map((name) => `Procedimientos: ${name}`))
		}

		// Verificar documentos ambientales
		const environmentalDocs = folder.environmentals || []
		const environmentalDocNames = environmentalDocs.map((doc) => doc.name)
		const missingEnvironmentalDocs = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.environment.documents
			.filter((doc) => doc.required && !environmentalDocNames.includes(doc.name))
			.map((doc) => doc.name)

		if (missingEnvironmentalDocs.length > 0) {
			missingDocs.push(...missingEnvironmentalDocs.map((name) => `Ambientales: ${name}`))
		}

		return missingDocs
	}

	const missingDocuments = getMissingDocuments()
	const hasMissingDocuments = missingDocuments.length > 0

	const onSubmit = async (values: SubmitFormSchema) => {
		if (hasMissingDocuments) {
			toast.error("No se puede enviar la carpeta. Faltan documentos requeridos.")
			return
		}

		if (!session?.user?.id) {
			toast.error("No se pudo identificar al usuario. Por favor inicie sesión nuevamente.")
			return
		}

		setIsSubmitting(true)

		try {
			const response = await fetch(`/api/startup-folders/work-order/status`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					folderId: folder.id,
					status: "SUBMITTED",
					submittedById: session.user.id,
					comments: values.comments,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || "Error al enviar la carpeta")
			}

			toast.success("Carpeta enviada para revisión correctamente")
			router.refresh()
		} catch (error) {
			console.error(error)
			toast.error(error instanceof Error ? error.message : "Error al enviar la carpeta")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
			{hasMissingDocuments && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Documentos pendientes</AlertTitle>
					<AlertDescription>
						Debe subir todos los documentos requeridos antes de enviar la carpeta para revisión.
					</AlertDescription>
					<div className="mt-2 pl-4">
						<ul className="list-disc space-y-1">
							{missingDocuments.map((docName, index) => (
								<li key={index}>{docName}</li>
							))}
						</ul>
					</div>
				</Alert>
			)}

			<Card className="p-6">
				<div className="space-y-4">
					<div>
						<h3 className="text-lg font-semibold">Enviar carpeta para revisión</h3>
						<p className="text-muted-foreground text-sm">
							La carpeta será enviada para que el equipo de OTC la revise. Una vez enviada, no podrá
							modificar los documentos hasta que sea aprobada o rechazada.
						</p>
					</div>

					<Separator />

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<TextAreaFormField<SubmitFormSchema>
								name="comments"
								label="Comentarios (opcional)"
								placeholder="Agregue comentarios o notas para el revisor..."
								control={form.control}
							/>

							<Button
								type="submit"
								disabled={isSubmitting || hasMissingDocuments}
								className="w-full sm:w-auto"
							>
								{isSubmitting ? "Enviando..." : "Enviar para revisión"}
								<SendIcon className="ml-2 h-4 w-4" />
							</Button>
						</form>
					</Form>
				</div>
			</Card>
		</div>
	)
}
