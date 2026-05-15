"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { type LoginSchema, loginSchema } from "@/project/auth/schemas/login-schema"
import { authClient } from "@/lib/auth-client"

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import ResetPasswordRequest from "@/project/auth/components/forms/ResetPasswordRequest"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Form } from "@/shared/components/ui/form"
import { EyeIcon, EyeOffIcon } from "lucide-react"

interface LoginFormProps {
	callbackUrl?: string
}

export default function LoginForm({ callbackUrl }: LoginFormProps): React.ReactElement {
	const [showPassword, setShowPassword] = useState(false)
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
					} else if (callbackUrl) {
						router.push(callbackUrl)
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
		<Card className="w-full gap-6 overflow-visible border-none sm:w-4/5">
			<CardHeader className="gap-1">
				<CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
				<CardDescription className="text-text/80 leading-relaxed">
					Ingresa tus datos para acceder a tu cuenta.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
						<InputFormField<LoginSchema>
							name="email"
							label="Email"
							className="h-11"
							placeholder="Email"
							control={form.control}
						/>

						<div className="relative">
							<InputFormField<LoginSchema>
								name="password"
								className="h-11"
								label="Contraseña"
								control={form.control}
								placeholder="Contraseña"
								type={showPassword ? "text" : "password"}
							/>

							<div
								onClick={() => setShowPassword(!showPassword)}
								className="text-muted-foreground absolute top-11 right-3 -translate-y-1/2 [&>svg]:size-5"
							>
								{showPassword ? <EyeOffIcon /> : <EyeIcon />}
							</div>
						</div>

						<SubmitButton
							label="Iniciar sesión"
							isSubmitting={loading}
							className="hover:bg-primary mt-1 h-11 tracking-wide text-white hover:text-white hover:brightness-90"
						/>
					</form>
				</Form>
			</CardContent>

			<CardFooter className="justify-center">
				<ResetPasswordRequest />
			</CardFooter>
		</Card>
	)
}
