"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { type LoginSchema, loginSchema } from "@/lib/form-schemas/auth/login-schema"
import { authClient } from "@/lib/auth-client"

import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "../shared/SubmitButton"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoginForm(): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	async function onSubmit(values: LoginSchema) {
		await authClient.signIn.email(
			{
				email: values.email,
				password: values.password,
			},
			{
				onRequest: () => {
					setLoading(true)
				},
				onSuccess: async (ctx) => {
					if (ctx.data.twoFactorRedirect) {
						router.push("/auth/2fa")
					} else {
						router.push("/dashboard/documentacion")
					}
				},
				onError: (ctx) => {
					setLoading(false)
					toast("Error", {
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
				<h2 className="text-2xl font-bold">Iniciar Sesión</h2>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-3">
						<InputFormField<LoginSchema>
							control={form.control}
							name="email"
							label="Email"
							placeholder="Email"
						/>

						<InputFormField<LoginSchema>
							control={form.control}
							name="password"
							type="password"
							label="Contraseña"
							placeholder="Contraseña"
						/>

						<SubmitButton label="Iniciar sesión" isSubmitting={loading} />
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
