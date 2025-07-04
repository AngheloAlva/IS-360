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
} from "@/project/auth/schemas/reset-password-schema"

import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Form } from "@/shared/components/ui/form"
import { CheckIcon } from "lucide-react"

interface ResetPasswordFormProps {
	token: string
}

interface PasswordRequirement {
	regex: RegExp
	label: string
}

const passwordRequirements: PasswordRequirement[] = [
	{ regex: /^.{8,}$/, label: "Mínimo 8 caracteres" },
	{ regex: /[A-Z]/, label: "Al menos una mayúscula" },
	{ regex: /[a-z]/, label: "Al menos una minúscula" },
	{ regex: /[0-9]/, label: "Al menos un número" },
	{ regex: /[^A-Za-z0-9]/, label: "Al menos un carácter especial" },
]

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

	const password = form.watch("password")

	return (
		<Card className="w-full border-none sm:w-4/5">
			<CardHeader className="gap-1">
				<h2 className="text-2xl font-bold">Restablecer contraseña</h2>
				<p className="text-text/80 leading-relaxed">Ingresa tu nueva contraseña</p>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
						<div className="space-y-4">
							<InputFormField<ResetPasswordSchema>
								control={form.control}
								name="password"
								type="password"
								label="Nueva contraseña"
								placeholder="Nueva contraseña"
							/>

							<div className="space-y-2">
								<p className="text-sm font-medium">Requisitos de contraseña:</p>
								<ul className="space-y-1">
									{passwordRequirements.map((req, index) => (
										<li
											key={index}
											className={`text-sm ${
												req.regex.test(password) ? "text-green-600" : "text-red-500"
											}`}
										>
											<CheckIcon className="mr-1 inline size-3.5" />
											{req.label}
										</li>
									))}
								</ul>
							</div>
						</div>

						<SubmitButton
							isSubmitting={loading}
							label="Restablecer contraseña"
							className="mt-4 bg-green-600 text-white hover:bg-green-600 hover:text-white"
						/>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
