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

import { updateFolder } from "@/actions/document-management/updateFolder"
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

import type { Folder } from "@prisma/client"

export default function UpdateFolderForm({
	userId,
	lastPath,
	oldFolder,
}: {
	userId: string
	lastPath?: string
	oldFolder: Folder
}): React.ReactElement {
	const [loading, setLoading] = useState(false)

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

				if (lastPath) {
					router.push(`${lastPath}`)
				} else {
					router.push(
						`/dashboard/documentacion/${Object.keys(Areas).find((key) => (Areas[key as keyof typeof Areas].title as string) === oldFolder.area)}`
					)
				}
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
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mx-auto grid w-full max-w-screen-md gap-4"
			>
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
							placeholder="Descripción de la Carpeta..."
						/>

						<SelectFormField<FolderFormSchema>
							name="type"
							options={FolderTypes}
							control={form.control}
							label="Tipo de Carpeta"
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

				<SubmitButton isSubmitting={loading} label="Actualizar Carpeta" />
			</form>
		</Form>
	)
}
