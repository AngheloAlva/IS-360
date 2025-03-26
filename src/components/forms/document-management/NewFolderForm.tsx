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

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
} from "@/components/ui/form"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger,
} from "@/components/ui/select"

export default function NewFolderForm({
	area,
	userId,
	backPath,
	parentSlug,
	isRootFolder,
}: {
	userId: string
	backPath?: string
	parentSlug?: string
	isRootFolder: boolean
	area: (typeof Areas)[keyof typeof Areas]["value"]
}): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<FolderFormSchema>({
		resolver: zodResolver(folderFormSchema),
		defaultValues: {
			area,
			userId,
			name: "",
			type: "default",
			description: "",
			root: isRootFolder,
			parentSlug: parentSlug || "",
		},
	})

	async function onSubmit(values: FolderFormSchema) {
		try {
			setLoading(true)

			const { ok, data, message } = await createFolder(values)

			if (ok) {
				toast("Carpeta creada con éxito", {
					description: message,
					duration: 5000,
				})

				if (backPath) {
					router.push(`${backPath}/${data?.slug}`)
				} else {
					router.push(
						`/dashboard/documentacion/${Object.keys(Areas).find((key) => Areas[key as keyof typeof Areas].title === area)}/${data?.slug}`
					)
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
			setLoading(false)
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mx-auto grid w-full max-w-screen-md gap-4"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Nombre de la Carpeta</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Nombre de la Carpeta"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="gap-1 text-gray-700">
								Descipción de la Carpeta
								<span className="text-muted-foreground text-xs">(opcional)</span>
							</FormLabel>
							<FormControl>
								<Textarea
									className="min-h-20 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Descripción de la Carpeta..."
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo de Carpeta</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="border-gray-200">
										<SelectValue placeholder="Seleccione un tipo" />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="text-neutral-700">
									{FolderTypes.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<span className="text-muted-foreground mt-4 font-medium underline">Tipos de carpetas</span>
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

				<Button className="mt-4" type="submit" size={"lg"} disabled={loading}>
					{loading ? (
						<div role="status" className="flex items-center justify-center">
							<svg
								aria-hidden="true"
								className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
							<span className="sr-only">Cargando...</span>
						</div>
					) : (
						"Crear Carpeta"
					)}
				</Button>
			</form>
		</Form>
	)
}
