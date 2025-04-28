"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { EditIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { FolderTypes as FolderTypesConst } from "@/lib/consts/folder-types"
import { updateFolder } from "@/actions/document-management/updateFolder"
import {
	folderFormSchema,
	type FolderFormSchema,
} from "@/lib/form-schemas/document-management/folder.schema"

import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Form } from "@/components/ui/form"
import FolderTypes from "./FolderTypes"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

import type { Folder } from "@prisma/client"

export default function UpdateFolderFormSheet({
	userId,
	oldFolder,
}: {
	userId: string
	oldFolder: Folder
}): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const router = useRouter()

	const form = useForm<FolderFormSchema>({
		resolver: zodResolver(folderFormSchema),
		defaultValues: {
			userId,
			area: oldFolder.area,
			name: oldFolder.name,
			type: oldFolder.type,
			root: oldFolder.root,
			description: oldFolder.description || "",
		},
	})

	async function onSubmit(values: FolderFormSchema) {
		try {
			setLoading(true)

			const { ok, message } = await updateFolder({ id: oldFolder.id, values })

			if (ok) {
				toast("Carpeta actualizada con éxito", {
					description: message,
					duration: 5000,
				})

				setOpen(false)
				router.refresh()
			} else {
				toast("Error al actualizar la carpeta", {
					description: message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)
			toast("Error al actualizar la carpeta", {
				description: "Ocurrió un error al intentar actualizar la carpeta",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="flex w-full items-center justify-center gap-1 rounded-md bg-green-500 px-3 text-sm text-white hover:bg-green-500/80"
				onClick={() => setOpen(true)}
			>
				<EditIcon className="h-4 w-4" />
				<span className="hidden text-nowrap sm:inline">Editar Carpeta</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Editar Carpeta</SheetTitle>
					<SheetDescription>
						Complete el formulario con la información actualizada de la carpeta.
					</SheetDescription>
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
						/>

						<TextAreaFormField<FolderFormSchema>
							name="description"
							control={form.control}
							itemClassName="sm:col-span-2"
							label="Descipción de la Carpeta"
							placeholder="Descripción de la Carpeta..."
						/>

						<SubmitButton
							isSubmitting={loading}
							label="Actualizar Carpeta"
							className="hover:bg-primary/80 hover:text-white sm:col-span-2"
						/>
					</form>
				</Form>

				<FolderTypes />
			</SheetContent>
		</Sheet>
	)
}
