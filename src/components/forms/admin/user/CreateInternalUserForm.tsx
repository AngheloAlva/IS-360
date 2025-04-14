"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { sendNewUserEmail } from "@/actions/emails/sendRequestEmail"
import { InternalRoleOptions } from "@/lib/consts/internal-roles"
import { UserRoleOptions } from "@/lib/consts/user-roles"
import { AreaOptions } from "@/lib/consts/areas"
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

export default function CreateInternalUserForm(): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<InternalUserSchema>({
		resolver: zodResolver(internalUserSchema),
		defaultValues: {
			rut: "",
			name: "",
			email: "",
			phone: "",
			role: "USER",
		},
	})

	async function onSubmit(values: InternalUserSchema) {
		setLoading(true)

		const temporalPassword = generateTemporalPassword()

		try {
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

	return (
		<Card className="w-full max-w-screen-lg">
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid w-full max-w-screen-lg gap-x-3 gap-y-5 md:grid-cols-2"
					>
						<InputFormField<InternalUserSchema> name="name" label="Nombre" control={form.control} />

						<InputFormField<InternalUserSchema>
							name="email"
							label="Email"
							type="email"
							control={form.control}
						/>

						<RutFormField<InternalUserSchema> name="rut" label="RUT" control={form.control} />

						<InputFormField<InternalUserSchema>
							name="phone"
							label="Teléfono"
							control={form.control}
						/>

						<SelectFormField<InternalUserSchema>
							name="role"
							label="Rol"
							control={form.control}
							options={UserRoleOptions}
						/>

						<SelectFormField<InternalUserSchema>
							label="Cargo"
							name="internalRole"
							control={form.control}
							options={InternalRoleOptions}
						/>

						<SelectFormField<InternalUserSchema>
							name="area"
							label="Área"
							control={form.control}
							options={AreaOptions}
						/>

						<SubmitButton
							label="Crear Usuario"
							isSubmitting={loading}
							className="mt-4 md:col-span-2"
						/>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
