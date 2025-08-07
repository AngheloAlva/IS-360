"use client"

import { Building2Icon, MailsIcon, PlusCircleIcon, Share2Icon, Trash2Icon } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"

import { createExternalCompany } from "@/project/safety-talk/actions/createExternalCompany"
import {
	externalCompanySchema,
	type ExternalCompanySchema,
} from "@/project/safety-talk/schemas/external-company.schema"

import { InputFormField } from "@/shared/components/forms/InputFormField"
import { RutFormField } from "@/shared/components/forms/RutFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

type ExternalCompanyFormProps = {
	videoUrl: string
}

export default function ExternalCompanyForm({
	videoUrl,
}: ExternalCompanyFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<ExternalCompanySchema>({
		resolver: zodResolver(externalCompanySchema),
		defaultValues: {
			name: "",
			rut: "",
			emails: [{ email: "" }],
		},
	})

	const {
		fields: emailFields,
		append: appendEmail,
		remove: removeEmail,
	} = useFieldArray({
		control: form.control,
		name: "emails",
	})

	async function onSubmit(values: ExternalCompanySchema) {
		setLoading(true)

		try {
			const { ok, message, data } = await createExternalCompany({
				values,
				videoUrl,
				expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			})

			if (!ok || !data) {
				toast.error("Error al crear la empresa externa", {
					description: message,
					duration: 5000,
				})
				return
			}

			toast.success(message, {
				description: `Correos enviados: ${data.emailsSent || 0}/${data.totalEmails || 0}`,
				duration: 10000,
			})

			form.reset()
			setOpen(false)
		} catch (error) {
			console.error("Error creating external company:", error)
			toast.error("Error inesperado", {
				description: "Ocurrió un error inesperado al crear la empresa externa",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button>
					<Share2Icon className="h-4 w-4" />
					Compartir con Empresa Externa
				</Button>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader className="shadow">
					<SheetTitle>Compartir Charla con Empresa Externa</SheetTitle>
					<SheetDescription>
						Ingresa los datos de la empresa externa y los correos electrónicos de los participantes.
						Se generará un enlace único para que accedan a la charla.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex w-full flex-col gap-4 overflow-y-scroll px-4 pt-4 pb-16"
					>
						<div className="space-y-4">
							<div className="flex items-center gap-1.5">
								<Building2Icon className="text-muted-foreground size-4" />
								<h3 className="font-semibold">Datos de la Empresa</h3>
							</div>

							<InputFormField<ExternalCompanySchema>
								name="name"
								control={form.control}
								label="Nombre de la empresa"
								placeholder="Nombre de la empresa externa"
							/>

							<RutFormField<ExternalCompanySchema>
								name="rut"
								label="RUT de la empresa"
								control={form.control}
								placeholder="RUT de la empresa externa"
							/>
						</div>

						<Separator className="my-2" />

						<div className="space-y-4">
							<div>
								<div className="flex items-center gap-1.5">
									<MailsIcon className="text-muted-foreground size-4" />
									<h3 className="font-semibold">Correos Electrónicos de Participantes</h3>
								</div>

								<p className="text-muted-foreground text-sm">
									Agrega los correos electrónicos de las personas que realizarán la charla. Cada
									persona recibirá un enlace único para completar sus datos.
								</p>
							</div>

							{emailFields.map((field, index) => (
								<div key={field.id} className="flex items-end gap-2">
									<div className="flex-1">
										<InputFormField<ExternalCompanySchema>
											type="email"
											control={form.control}
											name={`emails.${index}.email`}
											placeholder="correo@empresa.com"
											label={index === 0 ? "Correo electrónico" : ""}
										/>
									</div>

									{emailFields.length > 1 && (
										<Button
											size="sm"
											type="button"
											variant="ghost"
											className="mb-2 text-red-500 hover:text-red-700"
											onClick={() => removeEmail(index)}
										>
											<Trash2Icon className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}

							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-primary hover:underline"
								onClick={() => appendEmail({ email: "" })}
							>
								<PlusCircleIcon className="h-4 w-4" />
								Agregar otro correo
							</Button>
						</div>

						<div className="flex justify-end pt-4">
							<SubmitButton label="Crear y Compartir Charla" isSubmitting={loading} />
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
