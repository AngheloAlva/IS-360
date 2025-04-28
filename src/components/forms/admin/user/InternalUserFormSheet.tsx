"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { sendNewUserEmail } from "@/actions/emails/sendRequestEmail"
import { InternalUserRoleOptions } from "@/lib/consts/user-roles"
import { InternalRoleOptions } from "@/lib/consts/internal-roles"
import { updateInternalUser } from "@/actions/users/updateUser"
import { AreaOptions } from "@/lib/consts/areas"
import { authClient } from "@/lib/auth-client"
import {
	internalUserSchema,
	type InternalUserSchema,
} from "@/lib/form-schemas/admin/user/internalUser.schema"

import { InputWithPrefixFormField } from "../../shared/InputWithPrefixFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { RutFormField } from "@/components/forms/shared/RutFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Form } from "@/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

import type { User } from "@prisma/client"

interface InternalUserFormProps {
	initialData?: User
}

export default function InternalUserFormSheet({
	initialData,
}: InternalUserFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<InternalUserSchema>({
		resolver: zodResolver(internalUserSchema),
		defaultValues: {
			rut: initialData?.rut || "",
			name: initialData?.name || "",
			email: initialData?.email || "",
			phone: initialData?.phone || "",
			role: initialData?.role || "USER",
			area: initialData?.area || undefined,
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

					toast.error("Error al crear el usuario", {
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
					toast.success("Usuario creado exitosamente", {
						description: "El usuario ha sido creado exitosamente",
						duration: 3000,
					})

					setOpen(false)
				} else {
					toast.error("Error al crear el usuario", {
						description: "Ocurrió un error al intentar crear el usuario",
						duration: 5000,
					})
				}
			} else {
				const { ok, data } = await updateInternalUser({ userId: initialData.id, values })

				if (ok) {
					toast.success("Usuario actualizado exitosamente", {
						description: `El usuario ${data?.name} ha sido actualizado exitosamente`,
						duration: 3000,
					})
					setOpen(false)
				} else {
					toast.error("Error al actualizar el usuario", {
						description: "Ocurrió un error al intentar actualizar el usuario",
						duration: 5000,
					})
				}
			}
		} catch (error) {
			console.log(error)
			toast.error("Error al crear o actualizar el usuario", {
				description: "Ocurrió un error al intentar crear o actualizar el usuario",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}


	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger className="bg-primary text-white h-10 rounded-md px-3 text-sm flex items-center justify-center gap-1 hover:bg-primary/80" onClick={() => setOpen(true)}>
				<PlusIcon className="h-4 w-4" />
				<span className="hidden sm:inline text-nowrap">Nuevo Miembro</span>
			</SheetTrigger>

			<SheetContent className="sm:max-w-md gap-0">
				<SheetHeader>
					<SheetTitle>
						{initialData ? "Editar Miembro OTC" : "Nuevo Miembro OTC"}
					</SheetTitle>
					<SheetDescription>
						{initialData ? "" : "Al crear un nuevo usuario, se le enviará un correo electrónico con su contraseña temporal para acceder al sistema."}
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid sm:grid-cols-2 pt-4 gap-y-5 gap-x-2 px-4">
						<InputFormField<InternalUserSchema>
							name="name"
							label="Nombre"
							control={form.control}
							placeholder="Nombre de la persona"
						/>

						<RutFormField<InternalUserSchema> name="rut" label="RUT" control={form.control} />

						<InputFormField<InternalUserSchema>
							name="email"
							type="email"
							label="Email"
							control={form.control}
							placeholder="correo@ejemplo.com"
							itemClassName="sm:col-span-2"
						/>

						<InputWithPrefixFormField<InternalUserSchema>
							type="tel"
							name="phone"
							prefix="+56"
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

						<SubmitButton
							isSubmitting={loading}
							label={initialData ? "Actualizar Usuario" : "Crear Usuario"}
							className="hover:bg-primary mt-5 sm:col-span-2 hover:text-white hover:brightness-90"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
