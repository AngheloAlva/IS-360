"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { uploadMultipleFiles } from "@/actions/document-management/uploadMultipleFiles"
import { CodeOptions, CodesValues } from "@/lib/consts/codes"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { Areas } from "@/lib/consts/areas"
import {
	fileFormSchema,
	type FileFormSchema,
} from "@/lib/form-schemas/document-management/new-file.schema"

import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import UploadFilesFormField from "../shared/UploadFilesFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { FilePreview } from "@/components/ui/file-preview"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"


interface NewFileFormProps {
	area: string
	userId: string
	backPath?: string
	parentFolderId?: string
}

export function NewFileForm({ userId, parentFolderId, area, backPath }: NewFileFormProps) {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isOneFile, setIsOneFile] = useState(true)

	const router = useRouter()

	const form = useForm<FileFormSchema>({
		resolver: zodResolver(fileFormSchema),
		defaultValues: {
			userId,
			name: "",
			parentFolderId,
			description: "",
			expirationDate: undefined,
			registrationDate: new Date(),
			area: Areas[area as keyof typeof Areas].value,
		},
	})

	const onSubmit = async (values: FileFormSchema) => {
		const files = form.getValues("files")

		if (files.length === 0) {
			toast.error("Por favor, sube al menos un archivo")
			return
		}

		setIsSubmitting(true)

		try {
			const uploadResults = await uploadFilesToCloud({
				randomString: userId,
				containerType: "documents",
				secondaryName: values.name,
				files: files,
			})

			// Crear registros en la base de datos usando el server action
			const dbResponse = await uploadMultipleFiles({
				values: {
					...values,
					files: undefined,
				},
				files: uploadResults,
			})

			if (!dbResponse.ok) {
				throw new Error(dbResponse.error || "Error al guardar en la base de datos")
			}

			toast.success("Archivos subidos correctamente")
			router.push(backPath || `/dashboard/documentacion/${area}`)
		} catch (error) {
			console.error(error)
			toast.error(error instanceof Error ? error.message : "Error al subir los archivos")
		} finally {
			setIsSubmitting(false)
		}
	}

	useEffect(() => {
		console.log(form.getValues("files"))
		if (form.getValues("files").length > 1) {
			form.setValue("name", "")
			form.setValue("description", "")
			setIsOneFile(false)
		} else {
			setIsOneFile(true)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("files")])

	const codeIsOther = form.watch("code") === CodesValues.OTRO

	return (
		<div className="flex w-full flex-col gap-4 lg:flex-row xl:gap-6">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex w-full flex-col gap-4 xl:gap-6"
				>
					<Card className="w-full">
						<CardContent className="grid gap-5">
							<UploadFilesFormField
								name="files"
								maxFileSize={200}
								isMultiple={true}
								control={form.control}
								selectedFileIndex={selectedFileIndex}
								setSelectedFileIndex={setSelectedFileIndex}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="grid gap-6">
							<h3 className="text-lg font-semibold">Información del o los Documentos</h3>

							<InputFormField<FileFormSchema>
								optional
								name="name"
								disabled={!isOneFile}
								control={form.control}
								label="Nombre del documento"
								placeholder="Ej: Informe Técnico 2023"
								description="Puedes dejarlo en blanco y el nombre del archivo será el nombre del documento."
							/>

							<TextAreaFormField<FileFormSchema>
								optional
								name="description"
								label="Descripción"
								disabled={!isOneFile}
								control={form.control}
								placeholder="Agregue detalles adicionales..."
							/>

							<SelectFormField<FileFormSchema>
								name="code"
								options={CodeOptions}
								control={form.control}
								label="Código de ISO"
								placeholder="Seleccione un código"
							/>

							{codeIsOther && (
								<InputFormField<FileFormSchema>
									name="otherCode"
									control={form.control}
									placeholder="Ej: OTRO"
									label="Otro código de ISO"
								/>
							)}

							<div className="grid gap-4 md:grid-cols-2">
								<DatePickerFormField<FileFormSchema>
									control={form.control}
									name="registrationDate"
									label="Fecha de Registro"
									description="Fecha en la que se registro el documento originalmente. NO es la fecha de registro en este sistema."
								/>

								<DatePickerFormField<FileFormSchema>
									name="expirationDate"
									control={form.control}
									label="Fecha de Expiración"
									itemClassName="h-full flex flex-col items-start"
								/>
							</div>
						</CardContent>
					</Card>

					<SubmitButton
						label="Subir Documento"
						isSubmitting={isSubmitting}
						className="hover:bg-primary/80"
						disabled={form.getValues("files")?.length === 0}
					/>
				</form>
			</Form>

			<FilePreview
				file={selectedFileIndex !== null ? form.getValues("files")[selectedFileIndex] : null}
			/>
		</div>
	)
}
