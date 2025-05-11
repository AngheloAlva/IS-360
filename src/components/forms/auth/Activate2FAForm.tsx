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

const enable2faSchema = z.object({
	password: z.string().nonempty({ message: "La contraseña es obligatoria" }),
})

export default function Activate2FAForm() {
	const [loading2FA, setLoading2FA] = useState(false)
	const router = useRouter()

	const twoFactorForm = useForm<z.infer<typeof enable2faSchema>>({
		resolver: zodResolver(enable2faSchema),
		defaultValues: {
			password: "",
		},
	})

	const onSubmit2FA = async (values: z.infer<typeof enable2faSchema>) => {
		setLoading2FA(true)

		const { error } = await authClient.twoFactor.enable({
			password: values.password,
		})

		if (error) {
			toast.error("Error al activar 2FA", {
				description: error.message,
			})
			setLoading2FA(false)
			return
		}

		toast.success("2FA activado exitosamente")
		router.push("/dashboard/documentacion")
		setLoading2FA(false)
	}

	return (
		<Form {...twoFactorForm}>
			<form onSubmit={twoFactorForm.handleSubmit(onSubmit2FA)} className="grid gap-5">
				<InputFormField<z.infer<typeof enable2faSchema>>
					type="password"
					name="password"
					label="Contraseña"
					control={twoFactorForm.control}
				/>

				<SubmitButton
					label="Activar 2FA"
					isSubmitting={loading2FA}
					className="bg-green-500 hover:bg-green-600"
				/>
			</form>
		</Form>
	)
}
