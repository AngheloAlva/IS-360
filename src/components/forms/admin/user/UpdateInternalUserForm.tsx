"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { InternalRoleOptions } from "@/lib/consts/internal-roles"
import { updateInternalUser } from "@/actions/users/updateUser"
import { InternalUserRoleOptions } from "@/lib/consts/user-roles"
import { AreaOptions } from "@/lib/consts/areas"
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
	user: User
}

export default function UpdateInternalUserForm({
	user,
}: InternalUserFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<InternalUserSchema>({
		resolver: zodResolver(internalUserSchema),
		defaultValues: {
			rut: user.rut,
			name: user.name,
			area: user.area,
			role: user.role,
			email: user.email,
			internalRole: user.internalRole,
		},
	})

	async function onSubmit(values: InternalUserSchema) {
		setLoading(true)

		try {
			const { ok, data } = await updateInternalUser({ userId: user.id, values })

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
		} catch (error) {
			console.error(error)
			toast("Error al actualizar el usuario", {
				description: "Ocurrió un error al intentar actualizar el usuario",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-screen-lg">
				<Card className="w-full">
					<CardContent className="grid gap-3 md:grid-cols-2">
						<InputFormField<InternalUserSchema>
							name="name"
							label="Nombre"
							placeholder="Nombre"
							control={form.control}
						/>

						<InputFormField<InternalUserSchema>
							name="email"
							type="email"
							label="Email"
							placeholder="Email"
							control={form.control}
						/>

						<RutFormField<InternalUserSchema> name="rut" label="RUT" control={form.control} />

						<SelectFormField<InternalUserSchema>
							name="role"
							label="Rol"
							control={form.control}
							options={InternalUserRoleOptions}
						/>

						<SelectFormField<InternalUserSchema>
							name="internalRole"
							label="Rol Interno"
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
					</CardContent>
				</Card>

				<SubmitButton label="Actualizar Usuario" isSubmitting={loading} className="mt-4 w-full" />
			</form>
		</Form>
	)
}
