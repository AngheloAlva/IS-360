"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { UserIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { INTERNAL_ROLES_LABELS, InternalRoleOptions } from "@/lib/consts/internal-roles"
import { InternalUserRoleOptions, UserRolesLabels } from "@/lib/consts/user-roles"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { sendNewUserEmail } from "@/actions/emails/sendRequestEmail"
import { updateInternalUser } from "@/actions/users/updateUser"
import { AreaOptions, AreasLabels } from "@/lib/consts/areas"
import { authClient } from "@/lib/auth-client"
import {
	internalUserSchema,
	type InternalUserSchema,
} from "@/lib/form-schemas/admin/user/internalUser.schema"

import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { RutFormField } from "@/components/forms/shared/RutFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"

import type { User } from "@prisma/client"

interface InternalUserFormProps {
	initialData?: User
}

export default function InternalUserForm({
	initialData,
}: InternalUserFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<InternalUserSchema>({
		resolver: zodResolver(internalUserSchema),
		defaultValues: {
			rut: initialData?.rut || "",
			name: initialData?.name || "",
			email: initialData?.email || "",
			phone: initialData?.phone || "",
			area: initialData?.area || null,
			role: initialData?.role || "USER",
			internalRole: initialData?.internalRole || "NONE",
		},
	})

	async function onSubmit(values: InternalUserSchema) {
		setLoading(true)

		const temporalPassword = generateTemporalPassword()

		try {
			if (!initialData) {
				const { data, error } = await authClient.admin.createUser({
					name: values.name,
					role: values.role,
					email: values.email,
					password: temporalPassword,
					data: {
						rut: values.rut,
						area: values.area,
						phone: values.phone,
						internalRole: values.internalRole,
					},
				})

				if (!data || error) {
					if (error.code === "ONLY_ADMINS_CAN_ACCESS_THIS_ENDPOINT") {
						toast.error("No tienes permiso para crear usuarios", {
							duration: 5000,
						})
						return
					}

					if (error.code === "USER_ALREADY_EXISTS") {
						toast.error("El usuario ya existe", {
							description: "Verifique el RUT del usuario por favor.",
							duration: 5000,
						})
						return
					}

					toast("Error al crear el usuario", {
						description:
							"Por favor, verifique que los datos ingresados sean correctos y que el email o RUT no estén duplicados",
						duration: 5000,
					})
					return
				}

				await authClient.admin.setRole({
					userId: data.user.id,
					role: values.role,
				})
				sendNewUserEmail({
					name: values.name,
					email: values.email,
					password: temporalPassword,
				})

				if (data) {
					toast("Usuario creado exitosamente", {
						description: "El usuario ha sido creado exitosamente",
						duration: 3000,
					})

					router.push("/admin/dashboard/usuarios")
				} else {
					toast("Error al crear el usuario", {
						description: "Ocurrió un error al intentar crear el usuario",
						duration: 5000,
					})
				}
			} else {
				const { ok, data } = await updateInternalUser({ userId: initialData.id, values })

				if (ok) {
					toast("Usuario actualizado exitosamente", {
						description: `El usuario ${data?.name} ha sido actualizado exitosamente`,
						duration: 3000,
					})
					router.push("/admin/dashboard/usuarios")
				} else {
					toast("Error al actualizar el usuario", {
						description: "Ocurrió un error al intentar actualizar el usuario",
						duration: 5000,
					})
				}
			}
		} catch (error) {
			console.log(error)
			toast("Error al crear el usuario", {
				description: "Ocurrió un error al intentar crear el usuario",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	const formValues = form.watch()

	return (
		<div className="flex w-full max-w-screen-xl flex-col gap-6 lg:flex-row">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="w-full lg:w-2/3">
					<Card className="w-full">
						<CardContent className="grid w-full gap-x-3 gap-y-5 md:grid-cols-2">
							<div className="md:col-span-2">
								<h3 className="text-lg font-semibold">Información Personal</h3>
								{!initialData && (
									<p className="text-muted-foreground text-sm">
										Al crear un nuevo usuario, se le enviará un correo electrónico con su contraseña
										temporal para acceder al sistema.
									</p>
								)}
							</div>

							<InputFormField<InternalUserSchema>
								name="name"
								label="Nombre"
								control={form.control}
								placeholder="Nombre de la persona"
							/>

							<InputFormField<InternalUserSchema>
								name="email"
								type="email"
								label="Email"
								control={form.control}
								placeholder="correo@ejemplo.com"
							/>

							<RutFormField<InternalUserSchema> name="rut" label="RUT" control={form.control} />

							<InputFormField<InternalUserSchema>
								type="tel"
								name="phone"
								label="Teléfono"
								control={form.control}
								placeholder="9 XXXX XXXX"
							/>

							<SelectFormField<InternalUserSchema>
								name="role"
								label="Rol"
								control={form.control}
								options={InternalUserRoleOptions}
								placeholder="Selecciona un rol"
							/>

							<SelectFormField<InternalUserSchema>
								label="Cargo"
								name="internalRole"
								control={form.control}
								options={InternalRoleOptions}
								placeholder="Selecciona un cargo"
							/>

							<SelectFormField<InternalUserSchema>
								name="area"
								label="Área"
								options={AreaOptions}
								control={form.control}
								placeholder="Selecciona un área"
							/>
						</CardContent>
					</Card>

					<SubmitButton
						isSubmitting={loading}
						label={initialData ? "Actualizar Usuario" : "Crear Usuario"}
						className="hover:bg-primary mt-5 hover:text-white hover:brightness-90"
					/>
				</form>
			</Form>

			<Card className="h-fit w-full lg:w-1/3">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center space-y-4">
						<div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
							<UserIcon className="text-muted-foreground h-16 w-16" />
						</div>

						<div className="space-y-2 text-center">
							<h3 className="text-xl font-semibold">{formValues.name || "Nombre del Usuario"}</h3>
							<p className="text-muted-foreground text-sm">
								{formValues.email || "correo@ejemplo.com"}
							</p>
						</div>

						<div className="w-full space-y-2 pt-4">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">RUT:</span>
								<span>{formValues.rut || "XX.XXX.XXX-X"}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Teléfono:</span>
								<span>{formValues.phone || "9 XXXX XXXX"}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Rol:</span>
								<span>{UserRolesLabels[formValues.role] || "No especificado"}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Cargo:</span>
								<span>
									{INTERNAL_ROLES_LABELS[
										formValues.internalRole as keyof typeof INTERNAL_ROLES_LABELS
									] || "No especificado"}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Área:</span>
								<span>
									{AreasLabels[formValues.area as keyof typeof AreasLabels] || "No especificado"}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
