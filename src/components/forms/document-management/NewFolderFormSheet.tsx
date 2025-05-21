"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FolderIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createFolder } from "@/actions/document-management/createFolder"
import { FolderTypes as FolderTypesConst } from "@/lib/consts/folder-types"
import { queryClient } from "@/lib/queryClient"
import { Areas } from "@/lib/consts/areas"
import {
	folderFormSchema,
	type FolderFormSchema,
} from "@/lib/form-schemas/document-management/folder.schema"

import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import FolderTypes from "@/components/forms/document-management/FolderTypes"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
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

export default function NewFolderForm({
	area,
	userId,
	parentFolderId,
	isRootFolder = false,
}: {
	area: string
	userId: string
	isRootFolder?: boolean
	parentFolderId?: string
}): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const [open, setOpen] = useState(false)

	const areaValue = Areas[area as keyof typeof Areas].value

	const form = useForm<FolderFormSchema>({
		resolver: zodResolver(folderFormSchema),
		defaultValues: {
			userId,
			name: "",
			area: areaValue,
			type: "default",
			description: "",
			root: isRootFolder,
			parentFolderId: parentFolderId || "",
		},
	})

	async function onSubmit(values: FolderFormSchema) {
		try {
			setIsSubmitting(true)

			const { ok, message } = await createFolder(values)

			if (ok) {
				toast.success("Carpeta creada con éxito", {
					description: message,
					duration: 5000,
				})

				setOpen(false)
				queryClient.invalidateQueries({
					queryKey: ["documents", { area: areaValue, folderId: parentFolderId }],
				})
			} else {
				toast.error("Error al crear la carpeta", {
					description: message,
					duration: 5000,
				})
				setErrorMessage(message || "Ocurrió un error al intentar crear la carpeta")
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al crear la carpeta", {
				description:
					error instanceof Error ? error.message : "Ocurrió un error al intentar crear la carpeta",
				duration: 5000,
			})
			setErrorMessage(
				error instanceof Error ? error.message : "Ocurrió un error al intentar crear la carpeta"
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="bg-primary hover:bg-primary/80 flex h-10 items-center justify-center gap-1 rounded-md px-3 text-sm text-white"
				onClick={() => setOpen(true)}
			>
				<FolderIcon className="h-4 w-4" />
				<span className="hidden text-nowrap sm:inline">Nueva Carpeta</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Nueva Carpeta</SheetTitle>
					<SheetDescription>Complete el formulario para crear una nueva carpeta.</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-2 gap-y-5 px-4 pt-4 sm:grid-cols-2"
					>
						<InputFormField<FolderFormSchema>
							name="name"
							control={form.control}
							label="Nombre de la Carpeta"
							placeholder="Nombre de la Carpeta"
						/>

						<SelectFormField<FolderFormSchema>
							name="type"
							control={form.control}
							label="Tipo de Carpeta"
							options={FolderTypesConst}
							placeholder="Seleccione un tipo"
						/>

						<TextAreaFormField<FolderFormSchema>
							optional
							name="description"
							control={form.control}
							label="Descipción de la Carpeta"
							itemClassName="sm:col-span-2"
							placeholder="Descipción de la Carpeta"
						/>

						<div className="sm:col-span-2">
							{errorMessage && <span className="text-sm text-red-500">{errorMessage}</span>}

							<SubmitButton
								label="Crear Carpeta"
								isSubmitting={isSubmitting}
								className="hover:bg-primary/80 hover:text-white"
							/>
						</div>
					</form>
				</Form>

				<FolderTypes />
			</SheetContent>
		</Sheet>
	)
}
