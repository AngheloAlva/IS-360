"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import {
	FolderIcon,
	FolderCogIcon,
	FolderLockIcon,
	FolderCheckIcon,
	FolderClockIcon,
	FolderHeartIcon,
} from "lucide-react"

import { createFolder } from "@/actions/document-management/createFolder"
import { FolderTypes } from "@/lib/consts/folder-types"
import { Areas } from "@/lib/consts/areas"
import {
	folderFormSchema,
	type FolderFormSchema,
} from "@/lib/form-schemas/document-management/folder.schema"

import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"

export default function NewFolderForm({
	area,
	userId,
	backPath,
	parentSlug,
	isRootFolder = false,
}: {
	area: string
	userId: string
	backPath?: string
	parentSlug?: string
	isRootFolder?: boolean
}): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const router = useRouter()
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
			parentSlug: parentSlug || "",
		},
	})

	async function onSubmit(values: FolderFormSchema) {
		try {
			setIsSubmitting(true)

			const { ok, message } = await createFolder(values)

			if (ok) {
				toast("Carpeta creada con éxito", {
					description: message,
					duration: 5000,
				})

				if (backPath) {
					router.push(`${backPath}`)
				} else {
					router.push(`/dashboard/documentacion/${area}`)
				}
			} else {
				toast("Error al crear la carpeta", {
					description: message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)
			toast("Error al crear la carpeta", {
				description: "Ocurrió un error al intentar crear la carpeta",
				duration: 5000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full max-w-screen-md">
				<Card className="w-full">
					<CardContent className="grid gap-5">
						<InputFormField<FolderFormSchema>
							name="name"
							control={form.control}
							label="Nombre de la Carpeta"
							placeholder="Nombre de la Carpeta"
						/>

						<TextAreaFormField<FolderFormSchema>
							name="description"
							control={form.control}
							label="Descipción de la Carpeta"
							placeholder="Descipción de la Carpeta"
						/>

						<SelectFormField<FolderFormSchema>
							name="type"
							options={FolderTypes}
							control={form.control}
							label="Tipo de Carpeta"
							placeholder="Seleccione un tipo"
						/>

						<span className="text-muted-foreground mt-4 font-medium underline">
							Tipos de carpetas
						</span>
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
								<FolderIcon className="h-5 w-5 text-yellow-500" />
								<span>Por defecto</span>
							</div>
							<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
								<FolderCheckIcon className="h-5 w-5 text-green-500" />
								<span>Check</span>
							</div>
							<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
								<FolderClockIcon className="h-5 w-5 text-blue-500" />
								<span>Reloj</span>
							</div>
							<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
								<FolderCogIcon className="h-5 w-5 text-indigo-500" />
								<span>Servicio</span>
							</div>
							<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
								<FolderHeartIcon className="h-5 w-5 text-red-500" />
								<span>Favorito</span>
							</div>
							<div className="text-muted-foreground flex flex-col items-center justify-center text-sm">
								<FolderLockIcon className="h-5 w-5 text-gray-500" />
								<span>Bloqueado</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<SubmitButton isSubmitting={isSubmitting} label="Crear Carpeta" />
			</form>
		</Form>
	)
}
