"use client"

import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { EditIcon } from "lucide-react"
import { toast } from "sonner"

import { uploadFilesToCloud, UploadResult } from "@/lib/upload-files"
import { updateFile } from "@/project/document/actions/updateFile"
import { CodeOptions, CodesValues } from "@/lib/consts/codes"
import {
	updateFileSchema,
	type UpdateFileSchema,
} from "@/project/document/schemas/update-file.schema.ts"

import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import SubmitButton from "../../../../shared/components/forms/SubmitButton"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { Separator } from "@/shared/components/ui/separator"
import FileTable from "@/shared/components/forms/FileTable"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

import type { AREAS } from "@prisma/client"
import type { File } from "../../hooks/use-documents"

interface UpdateFileFormProps {
	userId: string
	fileId: string
	areaValue: AREAS
	initialData: File
	parentFolderId?: string
}

export function UpdateFileFormSheet({
	userId,
	fileId,
	initialData,
	areaValue,
	parentFolderId,
}: UpdateFileFormProps) {
	const [uploading, setUploading] = useState(false)
	const [open, setOpen] = useState(false)

	const queryClient = useQueryClient()

	const form = useForm<UpdateFileSchema>({
		resolver: zodResolver(updateFileSchema),
		defaultValues: {
			userId,
			fileId,
			name: initialData.name,
			code: initialData.code ?? undefined,
			description: initialData.description || "",
			revisionCount: `${initialData.revisionCount}`,
			registrationDate: new Date(initialData.registrationDate),
			expirationDate: initialData.expirationDate ? new Date(initialData.expirationDate) : undefined,
			file: [
				{
					file: undefined,
					url: initialData.url,
					type: initialData.type,
					title: initialData.name,
					preview: initialData.url,
					fileSize: initialData.size,
				},
			],
		},
	})

	const onSubmit = async (values: UpdateFileSchema) => {
		setUploading(true)
		const file = values.file[0]

		if (!file) {
			toast.error("Por favor, sube al menos un archivo")
			return
		}

		if (values.revisionCount && +values.revisionCount < 0) {
			toast.error("Por favor, ingresa un número válido para la revisión")
			return
		}

		try {
			let uploadResult: UploadResult[] | undefined

			if (file.file) {
				const uploadResultTemp = await uploadFilesToCloud({
					containerType: "documents",
					files: [file],
					randomString: userId,
					secondaryName: values.name,
				})

				if (!uploadResultTemp[0].url) throw new Error("Error al subir el archivo")

				uploadResult = uploadResultTemp
			}

			const saveResult = await updateFile({
				fileId,
				userId,
				code: values.code,
				name: values.name,
				otherCode: values.otherCode,
				previousUrl: initialData.url,
				previousName: initialData.name,
				description: values.description,
				expirationDate: values.expirationDate,
				registrationDate: values.registrationDate,
				url: uploadResult ? uploadResult[0].url : initialData.url,
				size: uploadResult ? uploadResult[0].size : initialData.size,
				type: uploadResult ? uploadResult[0].type : initialData.type,
			})

			if (!saveResult.ok) throw new Error(saveResult.error || "Error al guardar metadatos")

			toast.success("Documento subido correctamente")
			setOpen(false)
			queryClient.invalidateQueries({
				queryKey: ["documents", { area: areaValue, folderId: parentFolderId }],
			})
		} catch (error) {
			console.error(error)
			toast.error("Error al subir el documento", {
				description: "Ha ocurrido un error al subir el documento",
				duration: 5000,
			})
		} finally {
			setUploading(false)
		}
	}

	const codeIsOther = form.watch("code") === CodesValues.OTRO

	useEffect(() => {
		console.log(form.formState.errors)
	}, [form.formState.errors])

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="flex w-full items-center justify-center gap-1 rounded-md bg-green-500 px-3 text-sm text-white hover:bg-green-500/80"
				onClick={() => setOpen(true)}
			>
				<EditIcon className="h-4 w-4" />
				<span className="hidden text-nowrap sm:inline">Editar</span>
			</SheetTrigger>

			<SheetContent className="gap-0 overflow-y-scroll pb-14 sm:max-w-[60dvw] 2xl:max-w-[50dvw]">
				<SheetHeader className="shadow">
					<SheetTitle>Actualizar Documento</SheetTitle>
					<SheetDescription>Complete el formulario para actualizar el documento.</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-3 gap-y-6 px-4 pt-4 sm:grid-cols-2"
					>
						<FileTable
							name="file"
							label="Archivo"
							control={form.control}
							className="sm:col-span-2"
						/>

						<Separator className="sm:col-span-2" />

						<div className="sm:col-span-2">
							<h3 className="text-lg font-semibold">Información del Documento</h3>
							<p className="text-muted-foreground text-sm">
								Puedes dejar el nombre del documento en blanco y el nombre del archivo será el
								nombre oficial.
							</p>
						</div>

						<InputFormField<UpdateFileSchema>
							name="name"
							control={form.control}
							label="Nombre del archivo"
							placeholder="Nombre del archivo"
						/>

						<SelectFormField<UpdateFileSchema>
							name="code"
							label="Código"
							placeholder="Código"
							options={CodeOptions}
							control={form.control}
						/>

						{codeIsOther && (
							<InputFormField<UpdateFileSchema>
								name="otherCode"
								control={form.control}
								placeholder="Ej: OTRO"
								label="Otro código de clasificación"
							/>
						)}

						<InputFormField<UpdateFileSchema>
							min={0}
							type="number"
							name="revisionCount"
							control={form.control}
							label="Número de Revisión"
							placeholder="Número de Revisión"
						/>

						<TextAreaFormField<UpdateFileSchema>
							name="description"
							label="Descripción"
							control={form.control}
							itemClassName="sm:col-span-2"
							placeholder="Agregar detalles adicionales..."
						/>

						<DatePickerFormField<UpdateFileSchema>
							control={form.control}
							name="registrationDate"
							label="Fecha de Registro"
							description="Fecha en la que se registro el documento originalmente. NO es la fecha de registro en este sistema."
						/>

						<DatePickerFormField<UpdateFileSchema>
							name="expirationDate"
							control={form.control}
							label="Fecha de Expiración"
							itemClassName="h-full flex flex-col items-start"
						/>

						<SubmitButton
							isSubmitting={uploading}
							label="Actualizar Documento"
							className="hover:bg-primary/80 sm:col-span-2"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
