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
import { ShapesIcon } from "lucide-react"

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

	const formValues = form.watch()

	return (
		<div className="flex w-full max-w-screen-xl flex-col gap-6 lg:flex-row">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex w-full flex-col gap-4 lg:w-2/3"
				>
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

			<Card className="h-fit w-full lg:w-1/3">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center space-y-4">
						<div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
							<ShapesIcon className="text-muted-foreground h-16 w-16" />
						</div>

						<div className="space-y-2 text-center">
							<h3 className="text-xl font-semibold">{formValues.name || "Nombre del Equipo"}</h3>
							<p className="text-muted-foreground text-sm">{formValues.tag || "TAG del Equipo"}</p>
						</div>

						<div className="w-full space-y-2 pt-4">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Tipo de Equipo:</span>
								<span>{formValues.type || "Tipo de Equipo"}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Ubicación:</span>
								<span>{formValues.location || "Ubicación del Equipo"}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Operativo:</span>
								<span>{formValues.isOperational ? "Sí" : "No"}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
