import { useState } from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"

import Spinner from "@/components/shared/Spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Dialog,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/components/ui/dialog"

export default function ResetPasswordConfirmation(): React.ReactElement {
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
			<DialogTrigger className="text-primary text-sm font-medium tracking-wide hover:underline">
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
