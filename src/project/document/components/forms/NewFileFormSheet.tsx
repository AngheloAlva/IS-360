"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { fileFormSchema, type FileFormSchema } from "@/project/document/schemas/new-file.schema"
import { uploadMultipleFiles } from "@/project/document/actions/uploadMultipleFiles"
import { Areas, type DocumentAreasValuesArray } from "@/lib/consts/areas"
import { CodeOptions, CodesValues } from "@/lib/consts/codes"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"

import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import FileTable from "@/shared/components/forms/FileTable"
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

import type { AREAS } from "@prisma/client"

interface NewFileFormProps {
	userId: string
	areaValue: AREAS
	order: "asc" | "desc"
	area: keyof typeof Areas
	orderBy: "name" | "createdAt"
	parentFolderId?: string | null
}

export function NewFileFormSheet({
	area,
	order,
	userId,
	orderBy,
	areaValue,
	parentFolderId = null,
}: NewFileFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isOneFile, setIsOneFile] = useState(true)
	const [open, setOpen] = useState(false)

	const form = useForm<FileFormSchema>({
		resolver: zodResolver(fileFormSchema),
		defaultValues: {
			userId,
			name: "",
			description: "",
			expirationDate: undefined,
			registrationDate: new Date(),
			parentFolderId: parentFolderId || "",
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
			form.reset()
			setOpen(false)
			queryClient.invalidateQueries({
				queryKey: ["documents", { area: areaValue, folderId: parentFolderId, order, orderBy }],
			})
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
				className="flex h-10 items-center justify-center gap-1 rounded-md bg-green-600 px-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-green-700"
				onClick={() => setOpen(true)}
			>
				<UploadIcon className="h-4 w-4" />
				<span className="hidden text-nowrap sm:inline md:hidden xl:inline">Nuevo Archivo</span>
			</SheetTrigger>

			<SheetContent className="w-full max-w-[95dvw] gap-0 overflow-y-scroll sm:max-w-[70dvw] 2xl:max-w-[50dvw]">
				<SheetHeader className="shadow">
					<SheetTitle>Nuevo Documento</SheetTitle>
					<SheetDescription>Complete el formulario para crear un nuevo documento.</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-3 gap-y-5 overflow-x-hidden overflow-y-auto px-4 pt-4 pb-14 sm:grid-cols-2"
					>
						<FileTable<FileFormSchema>
							name="files"
							required={true}
							label="Archivos"
							isMultiple={true}
							control={form.control}
							className="sm:col-span-2"
						/>

						<Separator className="my-4 sm:col-span-2" />

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
							itemClassName="sm:col-span-2 lg:col-span-1"
							description="Fecha en la que se registro el documento originalmente. NO es la fecha de registro en este sistema."
						/>

						<DatePickerFormField<FileFormSchema>
							name="expirationDate"
							control={form.control}
							label="Fecha de Expiración"
							toYear={new Date().getFullYear() + 10}
							fromYear={new Date().getFullYear() - 5}
							itemClassName="h-full flex flex-col items-start sm:col-span-2 lg:col-span-1"
						/>

						<div className="mt-6 flex items-center gap-2 sm:col-span-2">
							<Button variant={"outline"} className="w-1/2" onClick={() => setOpen(false)}>
								Cancelar
							</Button>

							<SubmitButton
								label="Subir Documento"
								isSubmitting={isSubmitting}
								disabled={form.getValues("files")?.length === 0}
								className="w-1/2 bg-green-600 text-white hover:bg-green-700 hover:text-white"
							/>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
