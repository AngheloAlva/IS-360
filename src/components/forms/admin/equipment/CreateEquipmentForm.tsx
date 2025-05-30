"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createEquipment } from "@/actions/equipments/createEquipment"
import { queryClient } from "@/lib/queryClient"
import {
	equipmentSchema,
	type EquipmentSchema,
} from "@/lib/form-schemas/admin/equipment/equipment.schema"

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

import { uploadFilesToCloud, UploadResult } from "@/lib/upload-files"
import UploadFilesFormField from "../../shared/UploadFilesFormField"
import { Separator } from "@/components/ui/separator"

interface CreateEquipmentFormProps {
	parentId?: string
}

export default function CreateEquipmentForm({
	parentId,
}: CreateEquipmentFormProps): React.ReactElement {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)

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

		const files = form.getValues("files")
		let uploadResults: UploadResult[] = []

		try {
			if (files.length > 0) {
				uploadResults = await uploadFilesToCloud({
					files,
					randomString: values.tag,
					containerType: "equipment",
					secondaryName: values.name,
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
				className="bg-primary hover:bg-primary/80 flex h-10 cursor-pointer items-center justify-center gap-1 rounded-md px-3 text-sm text-white"
				onClick={() => setOpen(true)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				<span className="hidden text-nowrap sm:inline">Nuevo Equipo / Ubicación</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
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
							itemClassName="flex flex-row items-center gap-2"
						/>

						<Separator className="my-2 sm:col-span-2" />

						<div className="space-y-1 sm:col-span-2">
							<h3 className="text-sm font-medium">Documentación / Instructivos</h3>

							<UploadFilesFormField<EquipmentSchema>
								name="files"
								isMultiple={true}
								maxFileSize={500}
								canPreview={false}
								control={form.control}
								selectedFileIndex={selectedFileIndex}
								setSelectedFileIndex={setSelectedFileIndex}
							/>
						</div>

						<SubmitButton
							isSubmitting={loading}
							label="Crear Equipo / Ubicación"
							className="mt-4 w-full sm:col-span-2"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
