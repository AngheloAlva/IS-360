"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { type LoginSchema, loginSchema } from "@/features/auth/schemas/login-schema"
import { authClient } from "@/lib/auth-client"

import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card"
import ResetPasswordRequest from "@/features/auth/components/forms/ResetPasswordRequest"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Form } from "@/shared/components/ui/form"

export default function Login(): React.ReactElement {
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
						router.push("/admin/dashboard/inicio")
					}
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

			<CardFooter>
				<ResetPasswordRequest />
			</CardFooter>
		</Card>
	)
}
