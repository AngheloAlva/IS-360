"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { EditIcon } from "lucide-react"
import { toast } from "sonner"

import { useEquipment, type WorkEquipment } from "@/hooks/use-equipments"
import { updateEquipment } from "@/actions/equipments/updateEquipment"
import { queryClient } from "@/lib/queryClient"
import {
	equipmentSchema,
	type EquipmentSchema,
} from "@/lib/form-schemas/admin/equipment/equipment.schema"

import { SelectWithSearchFormField } from "@/components/forms/shared/SelectWithSearchFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SwitchFormField } from "@/components/forms/shared/SwitchFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Form } from "@/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

interface EditEquipmentFormProps {
	id: string
	equipments: WorkEquipment[]
}

export default function EditEquipmentForm({
	id,
	equipments,
}: EditEquipmentFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const { data: equipment } = useEquipment(id)

	const form = useForm<EquipmentSchema>({
		resolver: zodResolver(equipmentSchema),
		defaultValues: {
			name: "",
			tag: "",
			type: "",
			location: "",
			description: "",
			parentId: "",
			isOperational: true,
		},
	})

	useEffect(() => {
		if (equipment) {
			form.reset({
				name: equipment.name,
				tag: equipment.tag,
				type: equipment.type || "",
				location: equipment.location,
				description: equipment.description || "",
				parentId: equipment.parent?.id || "",
				isOperational: equipment.isOperational,
			})
		}
	}, [equipment, form])

	async function onSubmit(values: EquipmentSchema) {
		setLoading(true)

		try {
			const { ok, message } = await updateEquipment({ id, values })

			if (!ok) {
				toast("Error al actualizar el equipo", {
					description: message,
					duration: 5000,
				})
				return
			}

			toast("Equipo actualizado exitosamente", {
				duration: 3000,
			})

			queryClient.invalidateQueries({
				queryKey: ["equipment"],
			})
		} catch (error) {
			console.log(error)
			toast("Error al actualizar el equipo", {
				description: "Ocurrió un error al intentar actualizar el equipo",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="bg-primary/20 hover:bg-primary/80 flex size-9 cursor-pointer items-center justify-center rounded-md px-2.5 text-sm text-white"
				onClick={() => setOpen(true)}
			>
				<EditIcon className="size-5" />
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader className="shadow">
					<SheetTitle>Editar Equipo</SheetTitle>
					<SheetDescription>Complete el formulario para editar el equipo.</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-2 gap-y-5 px-4 pt-4 sm:grid-cols-2"
					>
						<InputFormField<EquipmentSchema>
							name="name"
							label="Nombre"
							control={form.control}
							itemClassName="sm:col-span-2"
							placeholder="Nombre del equipo"
						/>

						<InputFormField<EquipmentSchema>
							name="tag"
							label="TAG"
							control={form.control}
							placeholder="TAG del equipo"
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

						<SelectWithSearchFormField<EquipmentSchema>
							name="parentId"
							label="Equipo Padre"
							control={form.control}
							placeholder="Seleccione un equipo padre (opcional)"
							options={
								equipments
									? equipments.map((parent) => ({
											label: `${parent.tag} - ${parent.name}`,
											value: parent.id,
										}))
									: []
							}
							itemClassName="md:col-span-2"
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
							label="¿Está operativo?"
							control={form.control}
							itemClassName="flex flex-row items-center gap-2"
						/>

						<SubmitButton
							label="Guardar Cambios"
							isSubmitting={loading}
							className="mt-4 w-full sm:col-span-2"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
