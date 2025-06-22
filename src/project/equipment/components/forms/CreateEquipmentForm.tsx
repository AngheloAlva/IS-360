"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { uploadFilesToCloud, type UploadResult } from "@/lib/upload-files"
import { createEquipment } from "@/project/equipment/actions/createEquipment"
import { CriticalityOptions } from "@/lib/consts/criticality"
import { queryClient } from "@/lib/queryClient"
import { equipmentSchema, type EquipmentSchema } from "@/project/equipment/schemas/equipment.schema"

import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import FileTable from "@/shared/components/forms/FileTable"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

interface CreateEquipmentFormProps {
	parentId?: string
}

export default function CreateEquipmentForm({
	parentId,
}: CreateEquipmentFormProps): React.ReactElement {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)

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
			criticality: undefined,
		},
	})

	async function onSubmit(values: EquipmentSchema) {
		setLoading(true)

		const files = form.getValues("files")
		let uploadResults: UploadResult[] = []

		try {
			if (files.length > 0) {
				uploadResults = await uploadFilesToCloud({
					files,
					randomString: values.tag,
					containerType: "equipment",
					secondaryName: values.name,
					nameStrategy: "original", // Mantener el nombre original del archivo
				})
			}

			const { ok, message } = await createEquipment({ values, uploadResults })

			if (!ok) {
				toast.error("Error al crear el equipo", {
					description: message,
					duration: 5000,
				})
				return
			}

			toast.success("Equipo creado exitosamente", {
				duration: 3000,
			})

			setOpen(false)
			form.reset()
			queryClient.invalidateQueries({
				queryKey: ["equipment", { parentId: values.parentId ?? null }],
			})
		} catch (error) {
			console.log(error)
			toast.error("Error al crear el equipo", {
				description: "Ocurrió un error al intentar crear el equipo",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-medium text-emerald-600 transition-all hover:scale-105"
				onClick={() => setOpen(true)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				<span className="hidden text-nowrap sm:inline">Nuevo Equipo / Ubicación</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-lg">
				<SheetHeader className="shadow">
					<SheetTitle>Nuevo Equipo / Ubicación</SheetTitle>
					<SheetDescription>
						Complete el formulario para crear un nuevo equipo / ubicación.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-2 gap-y-5 overflow-y-auto px-4 pt-4 pb-14 sm:grid-cols-2"
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
							control={form.control}
							placeholder="Ubicación del equipo"
						/>

						<InputFormField<EquipmentSchema>
							name="type"
							label="Tipo de equipo"
							control={form.control}
							placeholder="Tipo de equipo"
						/>

						<SelectFormField<EquipmentSchema>
							name="criticality"
							label="Criticalidad"
							control={form.control}
							options={CriticalityOptions}
						/>

						<TextAreaFormField<EquipmentSchema>
							name="description"
							label="Descripción"
							control={form.control}
							itemClassName="sm:col-span-2"
							placeholder="Descripción del equipo"
						/>

						<SwitchFormField<EquipmentSchema>
							name="isOperational"
							control={form.control}
							label="¿Esta operativo?"
							className="data-[state=checked]:bg-emerald-600"
							itemClassName="flex flex-row items-center gap-2"
						/>

						<Separator className="mt-2 sm:col-span-2" />

						<FileTable<EquipmentSchema>
							name="files"
							isMultiple={true}
							maxFileSize={500}
							control={form.control}
							className="mt-2 sm:col-span-2"
							label="Documentación / Instructivos"
						/>

						<Separator className="my-4 sm:col-span-2" />

						<Button
							size={"lg"}
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							className="border-teal-700 text-teal-700 transition-all hover:scale-105 hover:bg-teal-700 hover:text-white"
						>
							Cancelar
						</Button>

						<SubmitButton
							isSubmitting={loading}
							label="Crear Equipo / Ubicación"
							className="bg-emerald-600 hover:bg-emerald-700 hover:text-white"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
