"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createEquipment } from "@/actions/equipments/createEquipment"
import {
	equipmentSchema,
	type EquipmentSchema,
} from "@/lib/form-schemas/admin/equipment/equipment.schema"

import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SwitchFormField } from "@/components/forms/shared/SwitchFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"

interface CreateEquipmentFormProps {
	parentId?: string
}

export default function CreateEquipmentForm({
	parentId,
}: CreateEquipmentFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<EquipmentSchema>({
		resolver: zodResolver(equipmentSchema),
		defaultValues: {
			name: "",
			tag: "",
			type: "",
			location: "",
			description: "",
			parentId: parentId,
			isOperational: true,
		},
	})

	async function onSubmit(values: EquipmentSchema) {
		setLoading(true)

		try {
			const { ok, message } = await createEquipment({ values })

			if (!ok) {
				toast("Error al crear el equipo", {
					description: message,
					duration: 5000,
				})
				return
			}

			toast("Equipo creado exitosamente", {
				duration: 3000,
			})

			router.push("/admin/dashboard/equipos")
		} catch (error) {
			console.log(error)
			toast("Error al crear el equipo", {
				description: "Ocurrió un error al intentar crear el equipo",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-screen-lg space-y-4">
				<Card className="w-full">
					<CardContent className="grid gap-4 md:grid-cols-2">
						<InputFormField<EquipmentSchema>
							name="name"
							label="Nombre"
							placeholder="Nombre del equipo"
							control={form.control}
						/>

						<InputFormField<EquipmentSchema>
							name="tag"
							label="TAG"
							placeholder="TAG del equipo"
							control={form.control}
						/>

						<InputFormField<EquipmentSchema>
							name="location"
							label="Ubicación"
							placeholder="Ubicación del equipo"
							control={form.control}
						/>

						<InputFormField<EquipmentSchema>
							name="type"
							label="Tipo de equipo"
							placeholder="Tipo de equipo"
							control={form.control}
						/>

						<TextAreaFormField<EquipmentSchema>
							name="description"
							label="Descripción"
							control={form.control}
							placeholder="Descripción del equipo"
							itemClassName="md:col-span-2"
						/>

						<SwitchFormField<EquipmentSchema>
							name="isOperational"
							label="¿Esta operativo?"
							control={form.control}
							itemClassName="flex flex-row items-center gap-2"
						/>
					</CardContent>
				</Card>

				<SubmitButton label="Crear Equipo" isSubmitting={loading} className="mt-4 w-full" />
			</form>
		</Form>
	)
}
