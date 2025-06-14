"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import {
	resetPasswordSchema,
	type ResetPasswordSchema,
} from "@/features/auth/schemas/reset-password-schema"

import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Form } from "@/shared/components/ui/form"

interface ResetPasswordFormProps {
	token: string
}

export default function ResetPassword({ token }: ResetPasswordFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<ResetPasswordSchema>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
		},
	})

	async function onSubmit(values: ResetPasswordSchema) {
		await authClient.resetPassword(
			{
				newPassword: values.password,
				token,
			},
			{
				onRequest: () => {
					setLoading(true)
				},
				onSuccess: async () => {
					toast.success("Contraseña restablecida exitosamente", {
						description: "Ahora puedes iniciar sesión con tu nueva contraseña",
						duration: 3000,
					})
					router.push("/auth/login")
				},
				onError: (ctx) => {
					setLoading(false)
					toast.error("Error", {
						description: ctx.error.message,
						duration: 4000,
					})
				},
			}
		)
	}

	return (
		<Card>
			<CardHeader>
				<h2 className="text-2xl font-bold">Restablecer contraseña</h2>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-3">
						<InputFormField<ResetPasswordSchema>
							control={form.control}
							name="password"
							type="password"
							label="Nueva contraseña"
							placeholder="Nueva contraseña"
						/>

						<SubmitButton
							isSubmitting={loading}
							label="Restablecer contraseña"
							className="hover:bg-primary/80"
						/>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
