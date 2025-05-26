"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, UserIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { createUserStartupFolder } from "@/actions/users/createUserStartupFolder"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { sendNewUserEmail } from "@/actions/emails/sendNewUserEmail"
import { authClient } from "@/lib/auth-client"
import {
	partnerUsersSchema,
	type PartnerUsersSchema,
} from "@/lib/form-schemas/partner/users.schema"

import { InputFormField } from "@/components/forms/shared/InputFormField"
import { RutFormField } from "@/components/forms/shared/RutFormField"
import { Card, CardContent } from "@/components/ui/card"
import BackButton from "@/components/shared/BackButton"
import SubmitButton from "../shared/SubmitButton"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

import type { User } from "@prisma/client"

export default function CreateUsersForm({ companyId }: { companyId: string }): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<PartnerUsersSchema>({
		resolver: zodResolver(partnerUsersSchema),
		defaultValues: {
			employees: [
				{
					rut: "",
					name: "",
					email: "",
					phone: "",
				},
			],
		},
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "employees",
	})

	async function onSubmit(values: PartnerUsersSchema) {
		setIsSubmitting(true)

		try {
			const results = await Promise.allSettled(
				values.employees.map(async (employee) => {
					const temporalPassword = generateTemporalPassword()

					const { data: newUser, error } = await authClient.admin.createUser({
						name: employee.name,
						email: employee.email,
						role: ["partnerCompany"],
						password: temporalPassword,
						data: {
							companyId,
							rut: employee.rut,
							isSupervisor: false,
							phone: employee.phone,
						},
					})

					if (error) {
						switch (error.code) {
							case "ONLY_ADMINS_CAN_ACCESS_THIS_ENDPOINT":
								throw new Error("No tienes permiso para crear colaboradores")
							case "USER_ALREADY_EXISTS":
								throw new Error(
									`El colaborador ${employee.name} ya existe. Verifique el RUT y el correo.`
								)
							default:
								throw new Error(`Error al crear colaborador ${employee.name}: ${error.message}`)
						}
					}

					await sendNewUserEmail({
						name: employee.name,
						email: employee.email,
						password: temporalPassword,
					})

					await createUserStartupFolder(newUser.user.id)
					return newUser
				})
			)

			const errors = results.filter(
				(result): result is PromiseRejectedResult => result.status === "rejected"
			)
			const successes = results.filter(
				(result): result is PromiseFulfilledResult<{ user: User & { role: string | undefined } }> =>
					result.status === "fulfilled"
			)

			if (errors.length > 0) {
				const errorMessages = errors.map((error) => error.reason.message)
				throw new Error(`Errores al crear colaboradores:\n${errorMessages.join("\n")}`)
			}

			toast.success("Colaboradores creados exitosamente", {
				description: `${successes.length} colaboradores han sido creados y se les ha enviado un correo con sus credenciales.`,
				duration: 5000,
			})
		} catch (error) {
			console.error(error)
			toast.error("Error al crear colaboradores", {
				description:
					error instanceof Error
						? error.message
						: "Ocurrió un error al intentar crear los colaboradores",
				duration: 5000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const formValues = form.getValues()

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<BackButton href="/dashboard/colaboradores" />
							<h2 className="text-2xl font-semibold">Crear Colaborador(es)</h2>
						</div>

						<Button
							type="button"
							variant="outline"
							className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600"
							onClick={() => {
								append({
									rut: "",
									name: "",
									email: "",
								})
							}}
						>
							<Plus className="h-4 w-4" />
							Agregar Colaborador
						</Button>
					</div>

					{fields.map((field, index) => (
						<div key={field.id} className="grid w-full gap-4 lg:grid-cols-3">
							<Card className="w-full lg:col-span-2">
								<CardContent>
									<div className="grid gap-5 xl:grid-cols-2">
										<div className="flex items-center justify-between xl:col-span-2">
											<h3 className="text-lg font-semibold">Colaborador #{index + 1}</h3>

											{index !== 0 && (
												<Button
													type="button"
													className="bg-red-500 text-white hover:bg-red-600"
													onClick={() => remove(index)}
													disabled={fields.length === 1}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>

										<InputFormField<PartnerUsersSchema>
											label="Nombre"
											placeholder="Nombre"
											control={form.control}
											name={`employees.${index}.name`}
										/>

										<RutFormField<PartnerUsersSchema>
											label="RUT"
											control={form.control}
											placeholder="12.345.678-9"
											name={`employees.${index}.rut`}
										/>

										<InputFormField<PartnerUsersSchema>
											type="email"
											label="Email"
											placeholder="Email"
											control={form.control}
											name={`employees.${index}.email`}
										/>
										<InputFormField<PartnerUsersSchema>
											type="tel"
											label="Teléfono"
											placeholder="Teléfono"
											control={form.control}
											name={`employees.${index}.phone`}
										/>
									</div>
								</CardContent>
							</Card>

							<Card className="hidden h-fit w-full lg:col-span-1 lg:block">
								<CardContent className="pt-4">
									<div className="flex flex-col items-center space-y-4">
										<div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
											<UserIcon className="text-muted-foreground h-14 w-14" />
										</div>

										<div className="space-y-1 text-center">
											<h3 className="text-xl font-semibold">
												{formValues.employees[index].name || "Nombre del Colaborador"}
											</h3>
											<p className="text-muted-foreground text-sm">
												{formValues.employees[index].email || "correo@ejemplo.com"}
											</p>
										</div>

										<div className="w-full space-y-1 pt-2">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">RUT:</span>
												<span>{formValues.employees[index].rut || "XX.XXX.XXX-X"}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Teléfono:</span>
												<span>{formValues.employees[index].phone || "+56 X XXXX XXXX"}</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					))}

					<SubmitButton
						label="Crear Colaborador(es)"
						isSubmitting={isSubmitting}
						className="hover:bg-primary/80"
					/>
				</form>
			</Form>
		</>
	)
}
