"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import BackButton from "@/components/shared/BackButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form"

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

export default function ChangePasswordPage(): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const form = useForm<z.infer<typeof changePasswordSchema>>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
		},
	})

	const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
		setLoading(true)

		const { error } = await authClient.changePassword({
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
		})

		if (error?.code === "INVALID_PASSWORD") {
			form.setError("currentPassword", { message: "La contraseña actual no es correcta" })
			setLoading(false)
			return
		}

		if (error) {
			toast.error("Error al cambiar la contraseña", {
				description: error.message,
			})
			setLoading(false)
			return
		}

		toast.success("Contraseña cambiada exitosamente")
		router.push("/dashboard/documentacion")
		setLoading(false)
	}

	return (
		<>
			<div className="mx-auto flex w-full max-w-lg items-center justify-start gap-2">
				<BackButton href="/dashboard/documentacion" />
				<h1 className="text-text text-2xl font-bold">Cambiar Contraseña</h1>
			</div>

			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardDescription>Ingrese su contraseña para cambiarla</CardDescription>
				</CardHeader>

				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
							<FormField
								control={form.control}
								name="currentPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contraseña actual</FormLabel>
										<FormControl>
											<Input
												type="password"
												className="w-full rounded-md"
												placeholder="Contraseña"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="newPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nueva contraseña</FormLabel>
										<FormControl>
											<Input
												type="password"
												className="w-full rounded-md"
												placeholder="Contraseña"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								size={"lg"}
								className="hover:bg-primary/80 w-full rounded-md text-sm"
								disabled={loading}
							>
								{loading ? "Cargando..." : "Cambiar Contraseña"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</>
	)
}
