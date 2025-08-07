"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { updateVisitorData } from "@/project/safety-talk/actions/updateVisitorData"
import {
	visitorDataSchema,
	type VisitorDataSchema,
} from "@/project/safety-talk/schemas/external-company.schema"

import { InputFormField } from "@/shared/components/forms/InputFormField"
import { RutFormField } from "@/shared/components/forms/RutFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Form } from "@/shared/components/ui/form"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

type VisitorDataFormProps = {
	token: string
	email: string
	companyName: string
	onSuccess?: () => void
}

export default function VisitorDataForm({
	token,
	email,
	companyName,
	onSuccess,
}: VisitorDataFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const form = useForm<VisitorDataSchema>({
		resolver: zodResolver(visitorDataSchema),
		defaultValues: {
			name: "",
			rut: "",
			email: email,
		},
	})

	async function onSubmit(values: VisitorDataSchema) {
		setLoading(true)

		try {
			const { ok, message } = await updateVisitorData({
				token,
				email,
				visitorData: values,
			})

			if (!ok) {
				toast.error("Error al actualizar datos", {
					description: message,
					duration: 5000,
				})
				return
			}

			toast.success("Datos actualizados exitosamente", {
				description: "Ahora puedes proceder a ver la charla de seguridad",
				duration: 5000,
			})

			onSuccess?.()
		} catch (error) {
			console.error("Error updating visitor data:", error)
			toast.error("Error inesperado", {
				description: "Ocurrió un error inesperado al actualizar los datos",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card className="bg-secondary-background mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle>Completar Datos Personales</CardTitle>
				<CardDescription>
					Por favor completa tus datos para acceder a la charla de seguridad de {companyName}.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<InputFormField<VisitorDataSchema>
							name="name"
							control={form.control}
							label="Nombre completo"
							placeholder="Tu nombre completo"
						/>

						<RutFormField<VisitorDataSchema>
							name="rut"
							label="RUT"
							control={form.control}
							placeholder="Tu RUT"
						/>

						<InputFormField<VisitorDataSchema>
							name="email"
							control={form.control}
							label="Correo electrónico"
							placeholder="tu@email.com"
							type="email"
							disabled
						/>

						<div className="pt-4">
							<SubmitButton
								isSubmitting={loading}
								label="Continuar a la Charla"
								className="w-full bg-blue-500 hover:bg-blue-600"
							/>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
