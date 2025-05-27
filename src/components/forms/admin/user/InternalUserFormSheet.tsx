"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { EditIcon, PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { UserAreaOptions, UserAreasValuesArray } from "@/lib/consts/areas"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { sendNewUserEmail } from "@/actions/emails/sendNewUserEmail"
import { USER_ROLE, USER_ROLE_LABELS } from "@/lib/permissions"
import { updateInternalUser } from "@/actions/users/updateUser"
import { queryClient } from "@/lib/queryClient"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
	internalUserSchema,
	type InternalUserSchema,
} from "@/lib/form-schemas/admin/user/internalUser.schema"

import { InputWithPrefixFormField } from "@/components/forms/shared/InputWithPrefixFormField"
import { MultiSelectFormField } from "@/components/forms/shared/MultiSelectFormField"
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

import type { ApiUser } from "@/types/user"

interface InternalUserFormProps {
	initialData?: ApiUser
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
			internalRole: initialData?.internalRole || "",
			role: initialData?.role ? initialData.role.split(",") : [USER_ROLE.user],
			area: (initialData?.area as (typeof UserAreasValuesArray)[number]) || undefined,
		},
	})

	async function onSubmit(values: InternalUserSchema) {
		setLoading(true)

		const temporalPassword = generateTemporalPassword()

		try {
			if (!initialData) {
				if (!values.role.length) {
					toast.error("Por favor, selecciona un rol")
					return
				}

				const { data, error } = await authClient.admin.createUser({
					name: values.name,
					email: values.email,
					password: temporalPassword,
					role: values.role as ["user"],
					data: {
						rut: values.rut,
						area: values.area,
						phone: values.phone,
						accessRole: "ADMIN",
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
					role: values.role as ["user"],
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
					queryClient.invalidateQueries({
						queryKey: ["users", { showOnlyInternal: true }],
					})
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
					queryClient.invalidateQueries({
						queryKey: ["users"],
					})
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
			<SheetTrigger
				className={cn(
					"bg-primary hover:bg-primary/80 flex h-10 cursor-pointer items-center justify-center gap-1 rounded-md px-3 text-sm text-white transition-colors",
					{
						"bg-primary/10 text-primary size-8 gap-0 p-1 hover:text-white": initialData,
					}
				)}
				onClick={() => setOpen(true)}
			>
				{initialData ? <EditIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
				<span className="hidden text-nowrap sm:inline">{!initialData && "Nuevo Usuario"}</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader className="shadow">
					<SheetTitle>{initialData ? "Editar Usuario" : "Nuevo Usuario"}</SheetTitle>
					<SheetDescription>
						{initialData
							? ""
							: "Al crear un nuevo usuario, se le enviará un correo electrónico con su contraseña temporal para acceder al sistema."}
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex h-full flex-col items-center justify-between overflow-y-auto px-4 pt-4 pb-14"
					>
						<div className="grid gap-x-2 gap-y-5 sm:grid-cols-2">
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
								itemClassName="sm:col-span-2"
								placeholder="correo@ejemplo.com"
								disabled={!!initialData}
							/>

							<InputWithPrefixFormField<InternalUserSchema>
								type="tel"
								name="phone"
								prefix="+56"
								label="Teléfono"
								control={form.control}
								placeholder="9 XXXX XXXX"
							/>

							<InputFormField<InternalUserSchema>
								name="internalRole"
								label="Cargo"
								control={form.control}
								placeholder="Cargo del usuario"
							/>

							<SelectFormField<InternalUserSchema>
								name="area"
								label="Área"
								control={form.control}
								options={UserAreaOptions}
								placeholder="Selecciona un área"
							/>

							<MultiSelectFormField<InternalUserSchema>
								name="role"
								label="Rol"
								control={form.control}
								itemClassName="sm:col-span-2"
								options={Array.from(Object.values(USER_ROLE)).map((role) => ({
									value: role,
									label: USER_ROLE_LABELS[role],
								}))}
								placeholder="Selecciona un rol"
							/>
						</div>

						<SubmitButton
							isSubmitting={loading}
							label={initialData ? "Actualizar Usuario" : "Crear Usuario"}
							className="hover:bg-primary mt-5 hover:text-white hover:brightness-90 sm:col-span-2"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
