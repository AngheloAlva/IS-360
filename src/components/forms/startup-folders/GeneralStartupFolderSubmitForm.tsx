"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { SendIcon, AlertTriangle } from "lucide-react"

import { GeneralStartupFolderWithDocuments } from "@/hooks/startup-folders/use-general-startup-folder"
import { authClient } from "@/lib/auth-client"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { Separator } from "@/components/ui/separator"

// Schema para enviar la carpeta a revisión
const submitFormSchema = z.object({
	comments: z.string().optional(),
})

type SubmitFormSchema = z.infer<typeof submitFormSchema>

interface GeneralStartupFolderSubmitFormProps {
	folder: GeneralStartupFolderWithDocuments
}

export function GeneralStartupFolderSubmitForm({ folder }: GeneralStartupFolderSubmitFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const { data: session } = authClient.useSession()

	const form = useForm<SubmitFormSchema>({
		resolver: zodResolver(submitFormSchema),
		defaultValues: {
			comments: "",
		},
	})

	// Verificar si hay documentos requeridos que faltan por subir
	const missingDocuments = folder.documents.filter((doc) => !doc.url)
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
			const response = await fetch(`/api/startup-folders/general/status`, {
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
							{missingDocuments.map((doc) => (
								<li key={doc.id}>{doc.name}</li>
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
