"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FolderIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createFolder } from "@/project/document/actions/createFolder"
import { FolderTypes as FolderTypesConst } from "@/lib/consts/folder-types"
import { queryClient } from "@/lib/queryClient"
import { Areas } from "@/lib/consts/areas"
import { folderFormSchema, type FolderFormSchema } from "@/project/document/schemas/folder.schema"

import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import FolderTypes from "@/project/document/components/forms/FolderTypes"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

export default function NewFolderForm({
	area,
	order,
	userId,
	orderBy,
	isRootFolder = false,
	parentFolderId = null,
}: {
	area: string
	userId: string
	order: "asc" | "desc"
	isRootFolder?: boolean
	orderBy: "name" | "createdAt"
	parentFolderId?: string | null
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
				form.reset()
				queryClient.invalidateQueries({
					queryKey: ["documents", { area: areaValue, folderId: parentFolderId, order, orderBy }],
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
				className="flex h-10 items-center justify-center gap-1 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700"
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
								className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
							/>
						</div>
					</form>
				</Form>

				<FolderTypes />
			</SheetContent>
		</Sheet>
	)
}
