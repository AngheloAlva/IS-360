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

const enable2faSchema = z.object({
	password: z.string().nonempty({ message: "La contraseña es obligatoria" }),
})

export default function Activate2FAPage(): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const form = useForm<z.infer<typeof enable2faSchema>>({
		resolver: zodResolver(enable2faSchema),
		defaultValues: {
			password: "",
		},
	})

	const onSubmit = async (values: z.infer<typeof enable2faSchema>) => {
		setLoading(true)

		const { error } = await authClient.twoFactor.enable({
			password: values.password,
		})

		if (error) {
			toast.error("Error al activar 2FA", {
				description: error.message,
			})
			return
		}

		toast.success("2FA activado exitosamente")
		router.push("/dashboard/documentacion")
		setLoading(false)
	}

	return (
		<>
			<div className="mx-auto flex w-full max-w-lg items-center justify-start gap-2">
				<BackButton href="/dashboard/documentacion" />
				<h1 className="text-text text-2xl font-bold">Activar 2FA</h1>
			</div>

			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardDescription>Ingrese su contraseña para activar 2FA</CardDescription>
				</CardHeader>

				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contaseña</FormLabel>
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
								size={"lg"}
								type="submit"
								disabled={loading}
								className="hover:bg-primary/80 w-full rounded-md text-sm"
							>
								{loading ? "Cargando..." : "Activar 2FA"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</>
	)
}
