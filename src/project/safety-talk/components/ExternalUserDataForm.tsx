"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { ExternalUserDataSchema, type ExternalUserData } from "../schemas/attempt.schema"
import { updateExternalUserData } from "../actions/create-invitation"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface ExternalUserDataFormProps {
	token: string
	email: string
	onComplete: (data: ExternalUserData) => void
	initialData?: {
		name?: string
		rut?: string
		companyName?: string
	}
}

export function ExternalUserDataForm({
	token,
	email,
	onComplete,
	initialData,
}: ExternalUserDataFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ExternalUserData>({
		resolver: zodResolver(ExternalUserDataSchema),
		defaultValues: initialData,
	})

	const onSubmit = async (data: ExternalUserData) => {
		setIsSubmitting(true)
		try {
			const result = await updateExternalUserData(token, email, data)

			if (result.success) {
				toast.success("Datos guardados exitosamente")
				onComplete(data)
			} else {
				toast.error(result.error || "Error al guardar los datos")
			}
		} catch (error) {
			console.error("Error submitting data:", error)
			toast.error("Error al guardar los datos")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Información Personal</CardTitle>
				<CardDescription>
					Por favor, completa tus datos antes de comenzar la evaluación
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Nombre Completo</Label>
						<Input
							id="name"
							{...register("name")}
							placeholder="Juan Pérez González"
							disabled={isSubmitting}
						/>
						{errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="rut">RUT</Label>
						<Input
							id="rut"
							{...register("rut")}
							placeholder="12.345.678-9"
							disabled={isSubmitting}
						/>
						{errors.rut && <p className="text-sm text-red-600">{errors.rut.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="companyName">Nombre de la Empresa</Label>
						<Input
							id="companyName"
							{...register("companyName")}
							placeholder="Empresa S.A."
							disabled={isSubmitting}
						/>
						{errors.companyName && (
							<p className="text-sm text-red-600">{errors.companyName.message}</p>
						)}
					</div>

					<Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
						{isSubmitting ? "Guardando..." : "Continuar a la Evaluación"}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
