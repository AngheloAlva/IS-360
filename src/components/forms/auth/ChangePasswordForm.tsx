"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"

import { InputFormField } from "../shared/InputFormField"
import SubmitButton from "../shared/SubmitButton"
import { Form } from "@/components/ui/form"

const changePasswordSchema = z.object({
	currentPassword: z.string().nonempty({ message: "La contraseña es obligatoria" }),
	newPassword: z
		.string()
		.min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/, {
			message:
				"La contraseña debe contener al menos 8 caracteres, una mayúscula, un número y un carácter especial",
		}),
})

export default function ChangePasswordForm() {
	const [loadingPassword, setLoadingPassword] = useState(false)
	const router = useRouter()

	const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
		},
	})

	const onSubmitPassword = async (values: z.infer<typeof changePasswordSchema>) => {
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
		router.push("/dashboard/documentacion")
		setLoadingPassword(false)
	}

	return (
		<Form {...passwordForm}>
			<form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="grid gap-5">
				<InputFormField<z.infer<typeof changePasswordSchema>>
					type="password"
					name="currentPassword"
					label="Contraseña actual"
					control={passwordForm.control}
				/>

				<InputFormField<z.infer<typeof changePasswordSchema>>
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
