"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { PlusCircleIcon, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"

import { useStartupFolderByCompany } from "@/project/startup-folder/hooks/use-startup-folder-by-company"
import { partnerUsersSchema, type PartnerUsersSchema } from "@/project/user/schemas/users.schema"
import { sendNewUserEmail } from "@/project/user/actions/sendNewUserEmail"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { queryClient } from "@/lib/queryClient"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

import { InputWithPrefixFormField } from "@/shared/components/forms/InputWithPrefixFormField"
import { MultiSelectFormField } from "@/shared/components/forms/MultiSelectFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
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
import { linkEntity } from "@/project/startup-folder/actions/link-entity"

export default function CreateUsersForm({
	companyId,
	className,
	isSupervisor = false,
}: {
	companyId: string
	className?: string
	isSupervisor?: boolean
}): React.ReactElement {
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
					isSupervisor,
					internalRole: "",
					internalArea: "",
					startupFoldersId: [],
				},
			],
		},
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "employees",
	})

	const { data: startupFolders, isLoading } = useStartupFolderByCompany({ companyId })

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
							phone: employee.phone,
							isSupervisor: employee.isSupervisor,
							internalRole: employee.internalRole,
							internalArea: employee.internalArea,
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

					if (employee.startupFoldersId) {
						employee.startupFoldersId.forEach(async (folderId) => {
							await linkEntity({
								entityId: newUser.user.id,
								startupFolderId: folderId,
								entityCategory: "PERSONNEL",
							})
						})
					}

					await sendNewUserEmail({
						name: employee.name,
						email: employee.email,
						password: temporalPassword,
					})

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
				className={cn(
					"flex h-10 items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-medium text-blue-600 transition-all hover:scale-105",
					className
				)}
				onClick={() => setIsOpen(true)}
			>
				<PlusCircleIcon className="size-4" />
				<span className="hidden sm:inline">
					{isSupervisor ? "Nuevo Supervisor" : "Nuevo Colaborador"}
				</span>
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
									<h3 className="text-lg font-semibold">
										{isSupervisor ? "Supervisor" : "Colaborador"} #{index + 1}
									</h3>

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
									label="Nombre completo"
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
								<InputWithPrefixFormField<PartnerUsersSchema>
									type="tel"
									prefix="+56"
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

								{!isSupervisor && (
									<MultiSelectFormField<PartnerUsersSchema>
										control={form.control}
										label="Carpetas de Arranque"
										itemClassName="sm:col-span-2"
										name={`employees.${index}.startupFoldersId`}
										description="Seleccione las carpetas de arranque en las que el colaborador participará."
										options={
											isLoading
												? []
												: (startupFolders?.map((folder) => ({
														value: folder.id,
														label: folder.name,
													})) ?? [])
										}
									/>
								)}

								<SwitchFormField<PartnerUsersSchema>
									label="¿Es Supervisor?"
									control={form.control}
									name={`employees.${index}.isSupervisor`}
								/>
							</div>
						))}

						<Button
							type="button"
							variant="ghost"
							className="cursor-pointer hover:bg-transparent hover:text-blue-500"
							onClick={() => {
								append({
									rut: "",
									name: "",
									email: "",
									phone: "",
									internalRole: "",
									internalArea: "",
									startupFoldersId: [],
								})
							}}
						>
							<PlusCircleIcon className="h-4 w-4" />
							Agregar {isSupervisor ? "Supervisor" : "Colaborador"}
						</Button>

						<div className="flex items-center justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								className="w-1/2"
								onClick={() => setIsOpen(false)}
							>
								Cancelar
							</Button>

							<SubmitButton
								isSubmitting={isSubmitting}
								label={isSupervisor ? "Crear Supervisor(es)" : "Crear Colaborador(es)"}
								className={cn(
									"w-1/2 bg-blue-700 hover:bg-blue-600",
									"bg-blue-600 hover:bg-blue-700"
								)}
							/>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
