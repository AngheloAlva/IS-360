"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { uploadMultipleFiles } from "@/actions/document-management/uploadMultipleFiles"
import { Areas, type DocumentAreasValuesArray } from "@/lib/consts/areas"
import { CodeOptions, CodesValues } from "@/lib/consts/codes"
import { uploadFilesToCloud } from "@/lib/upload-files"
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
import { Separator } from "@/components/ui/separator"
import { Form } from "@/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

interface NewFileFormProps {
	userId: string
	parentFolderId?: string
	area: keyof typeof Areas
}

export function NewFileFormSheet({ userId, parentFolderId, area }: NewFileFormProps) {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isOneFile, setIsOneFile] = useState(true)
	const [open, setOpen] = useState(false)

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
			area: Areas[area].value as (typeof DocumentAreasValuesArray)[number],
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
			setOpen(false)
			router.refresh()
		} catch (error) {
			console.error(error)
			toast.error(error instanceof Error ? error.message : "Error al subir los archivos")
		} finally {
			setIsSubmitting(false)
		}
	}

	useEffect(() => {
		if (form.getValues("files")?.length > 1) {
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
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="flex h-10 items-center justify-center gap-1 rounded-md bg-green-500 px-3 text-sm text-white hover:bg-green-500/80"
				onClick={() => setOpen(true)}
			>
				<UploadIcon className="h-4 w-4" />
				<span className="hidden text-nowrap sm:inline">Nuevo Archivo</span>
			</SheetTrigger>

			<SheetContent className="gap-0 overflow-y-scroll pb-14 sm:max-w-[60dvw] 2xl:max-w-[50dvw]">
				<SheetHeader className="shadow">
					<SheetTitle>Nuevo Documento</SheetTitle>
					<SheetDescription>Complete el formulario para crear un nuevo documento.</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-5 px-4 pt-4 lg:flex-row">
					<UploadFilesFormField
						name="files"
						isMultiple={true}
						maxFileSize={500}
						control={form.control}
						className="hidden lg:grid"
						containerClassName="w-full lg:w-2/3"
						selectedFileIndex={selectedFileIndex}
						setSelectedFileIndex={setSelectedFileIndex}
					/>

					<FilePreview
						className="hidden lg:block lg:w-1/3"
						file={selectedFileIndex !== null ? form.getValues("files")[selectedFileIndex] : null}
					/>
				</div>

				<Separator className="mt-6 mb-4" />

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-3 gap-y-5 px-4 sm:grid-cols-2"
					>
						<div className="sm:col-span-2">
							<h3 className="text-lg font-semibold">Información del o los Documentos</h3>
							<p className="text-muted-foreground text-sm">
								Puedes dejar el nombre del documento en blanco y el nombre del archivo será el
								nombre oficial.
							</p>
						</div>

						<InputFormField<FileFormSchema>
							optional
							name="name"
							disabled={!isOneFile}
							control={form.control}
							label="Nombre del documento"
							placeholder="Ej: Informe Técnico 2023"
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

						<TextAreaFormField<FileFormSchema>
							optional
							name="description"
							label="Descripción"
							disabled={!isOneFile}
							control={form.control}
							itemClassName="sm:col-span-2"
							placeholder="Agregue detalles adicionales..."
						/>

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

						<SubmitButton
							label="Subir Documento"
							isSubmitting={isSubmitting}
							className="hover:bg-primary/80 sm:col-span-2"
							disabled={form.getValues("files")?.length === 0}
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
