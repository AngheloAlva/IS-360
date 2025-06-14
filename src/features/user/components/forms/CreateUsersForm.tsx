"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { PlusCircleIcon, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"

import { createUserStartupFolder } from "@/features/startup-folder/actions/createWorkerStartupFolder"
import { partnerUsersSchema, type PartnerUsersSchema } from "@/features/user/schemas/users.schema"
import { sendNewUserEmail } from "@/features/user/actions/sendNewUserEmail"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { queryClient } from "@/lib/queryClient"
import { authClient } from "@/lib/auth-client"

import SubmitButton from "../../../../shared/components/forms/SubmitButton"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { RutFormField } from "@/shared/components/forms/RutFormField"
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

import type { User } from "@prisma/client"

export default function CreateUsersForm({ companyId }: { companyId: string }): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [isOpen, setIsOpen] = useState<boolean>(false)

	const form = useForm<PartnerUsersSchema>({
		resolver: zodResolver(partnerUsersSchema),
		defaultValues: {
			employees: [
				{
					rut: "",
					name: "",
					email: "",
					phone: "",
					internalRole: "",
					internalArea: "",
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

					if (!newUser) {
						throw new Error(`Error al crear usuario ${employee.name}`)
					}

					await authClient.admin.setRole({
						userId: newUser.user.id,
						role: "partnerCompany",
					})

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
			setIsOpen(false)
			form.reset()
			queryClient.invalidateQueries({
				queryKey: ["usersByCompany", { companyId }],
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

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger
				className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-medium text-orange-600 transition-all hover:scale-105"
				onClick={() => setIsOpen(true)}
			>
				<PlusCircleIcon className="size-4" />
				<span className="hidden sm:inline">Nuevo Colaborador</span>
			</SheetTrigger>

			<SheetContent className="sm:max-w-lg">
				<SheetHeader className="shadow">
					<SheetTitle>Agregar Colaborador</SheetTitle>
					<SheetDescription>
						Puede agregar un colaborador completando los campos del formulario.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6 overflow-y-auto px-4 pb-14"
					>
						{fields.map((field, index) => (
							<div key={field.id} className="grid gap-5 md:grid-cols-2">
								<div className="flex items-center justify-between md:col-span-2">
									<h3 className="text-lg font-semibold">Colaborador #{index + 1}</h3>

									{index !== 0 && (
										<Button
											type="button"
											variant="ghost"
											className="cursor-pointer hover:bg-transparent hover:text-red-500"
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
								<InputFormField<PartnerUsersSchema>
									label="Cargo"
									placeholder="Cargo"
									control={form.control}
									name={`employees.${index}.internalRole`}
								/>
								<InputFormField<PartnerUsersSchema>
									label="Área"
									placeholder="Área"
									control={form.control}
									name={`employees.${index}.internalArea`}
								/>
							</div>
						))}

						<Button
							type="button"
							variant="ghost"
							className="cursor-pointer hover:bg-transparent hover:text-orange-500"
							onClick={() => {
								append({
									rut: "",
									name: "",
									email: "",
								})
							}}
						>
							<PlusCircleIcon className="h-4 w-4" />
							Agregar Colaborador
						</Button>

						<div className="flex items-center justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								className="w-1/2 border-2 border-orange-900 text-orange-700 transition-all hover:scale-105 hover:bg-orange-900 hover:text-white"
								onClick={() => setIsOpen(false)}
							>
								Cancelar
							</Button>

							<SubmitButton
								isSubmitting={isSubmitting}
								label="Crear Colaborador(es)"
								className="w-1/2 bg-orange-700 hover:bg-orange-600"
							/>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
