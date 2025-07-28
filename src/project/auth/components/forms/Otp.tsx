"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { otpSchema, type OtpSchema } from "@/project/auth/schemas/otp.schema"
import { authClient } from "@/lib/auth-client"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
} from "@/shared/components/ui/form"

export default function Otp(): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const form = useForm<OtpSchema>({
		resolver: zodResolver(otpSchema),
		defaultValues: {
			otpCode: "",
			trustDevice: false,
		},
	})

	const onSubmit = async (data: OtpSchema) => {
		await authClient.twoFactor.verifyOtp(
			{
				code: data.otpCode,
				trustDevice: data.trustDevice,
			},
			{
				onRequest: () => {
					setLoading(true)
				},
				onSuccess: () => {
					toast("Se ha verificado el codigo de verificacion correctamente.")
					router.push("/admin/dashboard/inicio")
				},
				onError: () => {
					setLoading(false)
					toast.error("Ha ocurrido un error al verificar el codigo de verificacion.")
				},
			}
		)
	}

	return (
		<Card className="w-full border-none sm:w-4/5">
			<CardHeader className="gap-1">
				<h2 className="text-2xl font-bold">Verificación de Código</h2>
				<p className="text-text/80 leading-relaxed">
					Ingresa el codigo de verificacion que has recibido por correo.
				</p>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
						<FormField
							control={form.control}
							name="otpCode"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-lg">Codigo de verificacion</FormLabel>
									<FormControl>
										<InputOTP maxLength={6} {...field}>
											<InputOTPGroup>
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="trustDevice"
							render={({ field }) => (
								<FormItem className="flex items-center">
									<FormControl>
										<Checkbox
											className="bg-blue-500/20"
											checked={field.value}
											onCheckedChange={(checked) => field.onChange(checked)}
										/>
									</FormControl>

									<FormLabel>¿Recordar este dispositivo?</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>

						<SubmitButton
							label="Iniciar sesión"
							isSubmitting={loading}
							className="mt-2 bg-green-600 text-white hover:bg-green-600 hover:text-white"
						/>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
