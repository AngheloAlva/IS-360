"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import {
	changePasswordSchema,
	type ChangePasswordSchema,
} from "../../schemas/change.password.schema"

import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Form } from "@/shared/components/ui/form"

export default function ChangePassword() {
	const [loadingPassword, setLoadingPassword] = useState(false)
	const router = useRouter()

	const passwordForm = useForm<ChangePasswordSchema>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
		},
	})

	const onSubmitPassword = async (values: ChangePasswordSchema) => {
		setLoadingPassword(true)

		const { error } = await authClient.changePassword({
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
		})

		if (error?.code === "INVALID_PASSWORD") {
			passwordForm.setError("currentPassword", { message: "La contraseña actual no es correcta" })
			setLoadingPassword(false)
			return
		}

		if (error) {
			toast.error("Error al cambiar la contraseña", {
				description: error.message,
			})
			setLoadingPassword(false)
			return
		}

		toast.success("Contraseña cambiada exitosamente")
		router.push("/admin/dashboard/documentacion")
		setLoadingPassword(false)
	}

	return (
		<Form {...passwordForm}>
			<form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="grid gap-5">
				<InputFormField<ChangePasswordSchema>
					type="password"
					name="currentPassword"
					label="Contraseña actual"
					control={passwordForm.control}
				/>

				<InputFormField<ChangePasswordSchema>
					type="password"
					name="newPassword"
					label="Nueva Contraseña"
					control={passwordForm.control}
				/>

				<SubmitButton
					label="Cambiar contraseña"
					isSubmitting={loadingPassword}
					className="bg-purple-500 hover:bg-purple-600"
				/>
			</form>
		</Form>
	)
}
