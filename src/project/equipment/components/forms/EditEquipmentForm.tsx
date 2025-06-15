"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { EditIcon } from "lucide-react"
import { toast } from "sonner"

import { useEquipment, type WorkEquipment } from "@/project/equipment/hooks/use-equipments"
import { updateEquipment } from "@/project/equipment/actions/updateEquipment"
import { uploadFilesToCloud, type UploadResult } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import { equipmentSchema, type EquipmentSchema } from "@/project/equipment/schemas/equipment.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
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

import type { FileSchema } from "@/shared/schemas/file.schema"
import type { Attachment } from "@prisma/client"

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
	// Definimos el tipo extendido para incluir files
	type EquipmentWithFiles = WorkEquipment & { files?: FileSchema[]; attachments?: Attachment[] }
	// Convertimos el resultado
	const equipmentWithFiles = equipment as unknown as EquipmentWithFiles

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
			files: [],
		},
	})

	useEffect(() => {
		if (equipment) {
			const fileAttachments: FileSchema[] =
				equipmentWithFiles.attachments?.map((attachment) => ({
					url: attachment.url,
					type: attachment.type || "",
					title: attachment.name || "",
					preview: attachment.url,
					fileSize: attachment.size || 0,
					mimeType: attachment.type || "",
				})) || []

			form.reset({
				tag: equipment.tag,
				name: equipment.name,
				type: equipment.type || "",
				location: equipment.location,
				parentId: equipment.parentId || "",
				isOperational: equipment.isOperational,
				description: equipment.description || "",
				files: fileAttachments.length > 0 ? fileAttachments : equipmentWithFiles.files || [],
			})
		}
	}, [equipment, equipmentWithFiles, form])

	async function onSubmit(values: EquipmentSchema) {
		setLoading(true)

		const files = form.getValues("files")
		let uploadResults: UploadResult[] = []

		try {
			const filesToUpload = files.filter((file) => file.file)

			if (filesToUpload.length > 0) {
				uploadResults = await uploadFilesToCloud({
					files: filesToUpload,
					randomString: values.tag,
					containerType: "equipment",
					secondaryName: values.name,
					nameStrategy: "original",
				})
			}

			const existingFiles = files
				.filter((file) => !file.file)
				.map((fileObj) => {
					const { url, type, title, preview, fileSize, mimeType } = fileObj
					return { url, type, title, preview, fileSize, mimeType }
				})

			const convertedResults: FileSchema[] = uploadResults.map((result) => ({
				url: result.url,
				type: result.type,
				title: result.name,
				preview: result.url,
				fileSize: result.size,
				mimeType: result.type,
			}))

			const { ok, message } = await updateEquipment({
				id,
				values: {
					...values,
					files: [...existingFiles, ...convertedResults],
				},
			})

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
				className="bg-primary/20 text-text hover:bg-primary/80 flex size-9 cursor-pointer items-center justify-center rounded-md px-2.5 text-sm"
				onClick={() => setOpen(true)}
			>
				<EditIcon className="size-5" />
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-lg">
				<SheetHeader className="shadow">
					<SheetTitle>Editar Equipo</SheetTitle>
					<SheetDescription>Complete el formulario para editar el equipo.</SheetDescription>
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
							itemClassName="sm:col-span-2"
						/>

						<TextAreaFormField<EquipmentSchema>
							name="description"
							label="Descripción"
							control={form.control}
							placeholder="Descripción del equipo"
							itemClassName="sm:col-span-2"
						/>

						<SwitchFormField<EquipmentSchema>
							name="isOperational"
							label="¿Está operativo?"
							control={form.control}
							itemClassName="flex flex-row items-center gap-2"
						/>

						<Separator className="my-2 sm:col-span-2" />

						<FileTable<EquipmentSchema>
							name="files"
							isMultiple={true}
							maxFileSize={500}
							control={form.control}
							className="mt-2 sm:col-span-2"
							label="Documentación / Instructivos"
						/>

						<Separator className="my-2 sm:col-span-2" />
						<Button
							size={"lg"}
							variant="outline"
							onClick={() => setOpen(false)}
							className="border-teal-700 text-teal-700 transition-all hover:scale-105 hover:bg-teal-700 hover:text-white"
						>
							Cancelar
						</Button>

						<SubmitButton
							isSubmitting={loading}
							label="Guardar Cambios"
							className="bg-emerald-600 hover:bg-emerald-700"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
