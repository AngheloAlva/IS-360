"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { updateFile } from "@/actions/document-management/updateFile"
import { CodeOptions, CodesValues } from "@/lib/consts/codes"
import {
	updateFileSchema,
	type UpdateFileSchema,
} from "@/lib/form-schemas/document-management/update-file.schema.ts"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import UploadFilesFormField from "../shared/UploadFilesFormField"
import { Card, CardContent } from "@/components/ui/card"
import type { File as PrismaFile } from "@prisma/client"
import SubmitButton from "../shared/SubmitButton"
import { Form } from "@/components/ui/form"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { FilePreview } from "@/components/ui/file-preview"

interface UpdateFileFormProps {
	fileId: string
	userId: string
	lastPath?: string
	initialData: PrismaFile
}

export function UpdateFileForm({ fileId, initialData, userId, lastPath }: UpdateFileFormProps) {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [uploading, setUploading] = useState(false)

	const router = useRouter()

	const form = useForm<UpdateFileSchema>({
		resolver: zodResolver(updateFileSchema),
		defaultValues: {
			userId,
			fileId,
			name: initialData.name,
			code: initialData.code ?? undefined,
			description: initialData.description || "",
			registrationDate: initialData.registrationDate,
			expirationDate: initialData.expirationDate || undefined,
			file: [{
				file: undefined,
				url: initialData.url,
				type: initialData.type,
				title: initialData.name,
				preview: initialData.url,
				fileSize: initialData.size,
			}]
		},
	})

	const onSubmit = async (values: UpdateFileSchema) => {
		setUploading(true)
		const file = values.file[0]

		try {
			const uploadResult = await uploadFilesToCloud({
				containerType: 'documents',
				files: [file],
				randomString: userId,
				secondaryName: values.name,
			})

			const saveResult = await updateFile({
				fileId,
				userId,
				code: values.code,
				name: values.name,
				url: uploadResult[0].url,
				size: uploadResult[0].size,
				type: uploadResult[0].type,
				otherCode: values.otherCode,
				previousUrl: initialData.url,
				previousName: initialData.name,
				description: values.description,
				expirationDate: values.expirationDate,
				registrationDate: values.registrationDate,
			})

			if (!saveResult.ok) throw new Error(saveResult.error || "Error al guardar metadatos")

			toast.success("Documento subido correctamente")
			router.push(lastPath || `/dashboard/documentacion/`)
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

	useEffect(() => {
		console.log(form.formState.errors)
	}, [form.formState.errors])

	const codeIsOther = form.watch("code") === CodesValues.OTRO

	return (
		<div className="flex w-full flex-col gap-4 lg:flex-row xl:gap-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-4 xl:gap-6">
					<Card className="w-full">
						<CardContent className="grid gap-5">
							<UploadFilesFormField
								name="file"
								maxFileSize={200}
								isMultiple={false}
								control={form.control}
								selectedFileIndex={selectedFileIndex}
								setSelectedFileIndex={setSelectedFileIndex}
							/>

						</CardContent>
					</Card>

					<Card className="w-full">
						<CardContent className="grid gap-5">
							<InputFormField<UpdateFileSchema>
								name="name"
								control={form.control}
								label="Nombre del archivo"
								placeholder="Nombre del archivo"
							/>

							<TextAreaFormField<UpdateFileSchema>
								name="description"
								label="Descripción"
								control={form.control}
								placeholder="Descripción"
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

							<div className="grid gap-4 md:grid-cols-2">
								<DatePickerFormField<UpdateFileSchema>
									name="registrationDate"
									label="Fecha de Registro"
									control={form.control}
								/>

								<DatePickerFormField<UpdateFileSchema>
									name="expirationDate"
									control={form.control}
									label="Fecha de Expiración"
								/>
							</div>
						</CardContent>
					</Card>

					<SubmitButton isSubmitting={uploading} label="Actualizar Documento" className="hover:bg-primary/80" />
				</form>
			</Form>

			<FilePreview file={form.getValues("file")[0]} />
		</div>
	)
}
