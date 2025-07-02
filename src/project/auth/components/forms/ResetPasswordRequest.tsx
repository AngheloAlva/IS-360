"use client"

import { useState } from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import Spinner from "@/shared/components/Spinner"
import {
	Dialog,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

export default function ResetPasswordRequest(): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)
	const [email, setEmail] = useState("")

	async function onSubmit(values: { email: string }) {
		setIsSubmitting(true)

		const { error } = await authClient.forgetPassword({
			email: values.email,
			redirectTo: "/auth/restablecer-contrasena",
		})

		if (error) {
			setIsSubmitting(false)
			toast.error(error.message)
		}

		toast.success(
			"Se ha enviado un correo electrónico con el enlace para restablecer tu contraseña."
		)

		setIsSubmitting(false)
		setOpen(false)
		setEmail("")
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="text-sm font-medium tracking-wide text-green-600 hover:underline">
				¿Olvidaste tu contraseña?
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Restablecer contraseña</DialogTitle>
					<DialogDescription>
						Ingresa tu correo electrónico para restablecer tu contraseña.
					</DialogDescription>
				</DialogHeader>
				<div className="grid">
					<Input
						id="email"
						type="email"
						name="email"
						value={email}
						placeholder="ejemplo@email.com"
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<DialogFooter>
					<Button
						type="button"
						disabled={isSubmitting}
						className="hover:bg-primary/80"
						onClick={() => onSubmit({ email })}
					>
						{isSubmitting ? <Spinner /> : "Restablecer contraseña"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
