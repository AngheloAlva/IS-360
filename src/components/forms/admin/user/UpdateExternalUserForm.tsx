"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { updateExternalUser } from "@/actions/users/updateUser"
import {
	externalUserSchema,
	type ExternalUserSchema,
} from "@/lib/form-schemas/admin/user/externalUser.schema"

import { SwitchFormField } from "@/components/forms/shared/SwitchFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { RutFormField } from "@/components/forms/shared/RutFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"

import type { User } from "@prisma/client"

interface ExternalUserFormProps {
	user: User
}

export default function UpdateExternalUserForm({
	user,
}: ExternalUserFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<ExternalUserSchema>({
		resolver: zodResolver(externalUserSchema),
		defaultValues: {
			rut: user.rut,
			name: user.name,
			email: user.email,
			isSupervisor: user.isSupervisor ?? false,
		},
	})

	async function onSubmit(values: ExternalUserSchema) {
		setLoading(true)

		try {
			const { ok, data } = await updateExternalUser({ userId: user.id, values })

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
						<InputFormField<ExternalUserSchema>
							name="name"
							label="Nombre"
							placeholder="Nombre"
							control={form.control}
						/>

						<InputFormField<ExternalUserSchema>
							name="email"
							type="email"
							label="Email"
							placeholder="Email"
							control={form.control}
						/>

						<RutFormField<ExternalUserSchema>
							name="rut"
							label="RUT"
							placeholder="RUT"
							control={form.control}
						/>

						<SwitchFormField<ExternalUserSchema>
							name="isSupervisor"
							label="¿Es Supervisor?"
							control={form.control}
							itemClassName="flex h-9 flex-row items-center justify-start rounded-md border px-3 shadow-xs md:mt-5.5"
						/>
					</CardContent>
				</Card>

				<SubmitButton label="Actualizar Usuario" isSubmitting={loading} className="mt-4 w-full" />
			</form>
		</Form>
	)
}
