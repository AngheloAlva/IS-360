"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { otpSchema, type OtpSchema } from "@/features/auth/schemas/otp.schema"
import { authClient } from "@/lib/auth-client"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form"

export default function Otp(): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const form = useForm<OtpSchema>({
		resolver: zodResolver(otpSchema),
		defaultValues: {
			otpCode: "",
		},
	})

	const onSubmit = async (data: OtpSchema) => {
		await authClient.twoFactor.verifyOtp(
			{
				code: data.otpCode,
			},
			{
				onRequest: () => {
					setLoading(true)
				},
				onSuccess: () => {
					toast("Se ha verificado el codigo de verificacion correctamente.")
					router.push("/admin/dashboard/documentacion")
				},
				onError: () => {
					setLoading(false)
					toast.error("Ha ocurrido un error al verificar el codigo de verificacion.")
				},
			}
		)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-3">
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
							<FormDescription>
								Por favor, ingresa el codigo de verificacion enviado a tu correo.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<SubmitButton label="Iniciar sesión" isSubmitting={loading} />
			</form>
		</Form>
	)
}
