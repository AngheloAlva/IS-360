"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { updateFile } from "@/actions/document-management/updateFile"
import { Codes } from "@/lib/consts/codes"
import { cn } from "@/lib/utils"
import {
	fileFormSchema,
	type FileFormSchema,
} from "@/lib/form-schemas/document-management/file.schema"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormMessage,
	FormControl,
} from "@/components/ui/form"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

import type { File as PrismaFile } from "@prisma/client"

interface UpdateFileFormProps {
	fileId: string
	initialData: PrismaFile
	userId: string
	lastPath?: string
}

export function UpdateFileForm({ fileId, initialData, userId, lastPath }: UpdateFileFormProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [uploading, setUploading] = useState(false)
	const [message, setMessage] = useState("")

	const router = useRouter()

	const form = useForm<FileFormSchema>({
		resolver: zodResolver(fileFormSchema),
		defaultValues: {
			userId,
			name: initialData.name,
			code: initialData.code,
			description: initialData.description || "",
			registrationDate: initialData.registrationDate,
			expirationDate: initialData.expirationDate || undefined,
		},
	})

	const onSubmit = async (values: FileFormSchema) => {
		if (!selectedFile) {
			toast.error("Por favor selecciona un archivo")
			return
		}

		setUploading(true)
		setMessage("Actualizando documento...")

		try {
			const fileExtension = selectedFile.name.split(".").pop()
			const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

			const response = await fetch("/api/file", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ filenames: [uniqueFilename] }),
			})
			const data = await response.json()

			if (data.urls) {
				const uploadResponse = await fetch(data.urls[0], {
					method: "PUT",
					body: selectedFile,
				})

				if (uploadResponse.ok) {
					const fileSize = selectedFile.size
					const fileType = selectedFile.type

					const saveResult = await updateFile({
						...values,
						fileId,
						url: `${process.env.NEXT_PUBLIC_S3_URL}/${uniqueFilename}`,
						size: fileSize,
						type: fileType,
					})
					if (!saveResult.ok) {
						throw new Error("Error al guardar el documento en la base de datos")
					}

					setMessage("Documento subido correctamente")
					setSelectedFile(null)

					toast("Documento subido correctamente", {
						description: "El documento se ha subido correctamente",
						duration: 3000,
					})
					router.push(lastPath || `/dashboard/documentacion/`)
				}
			}
		} catch (error) {
			console.error(error)
			setMessage("Error al subir el documento")

			toast("Error al subir el documento", {
				description: "Ha ocurrido un error al subir el documento",
				duration: 5000,
			})
		} finally {
			setUploading(false)
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
							<FormLabel>Nombre del archivo</FormLabel>
							<FormControl>
								<Input {...field} disabled={uploading} />
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
							<FormLabel>Descripción</FormLabel>
							<FormControl>
								<Textarea {...field} disabled={uploading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Código</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="border-gray-200 capitalize">
										<SelectValue placeholder="Seleccione un código" />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="text-neutral-700">
									{Codes.map((option: string) => (
										<SelectItem key={option} value={option} className="capitalize">
											{option.toLocaleLowerCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="registrationDate"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Fecha de registro</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full pl-3 text-left font-normal",
												!field.value && "text-muted-foreground"
											)}
											disabled={uploading}
										>
											{field.value ? (
												format(field.value, "PPP", { locale: es })
											) : (
												<span>Selecciona una fecha</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
										initialFocus
										locale={es}
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="expirationDate"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Fecha de expiración</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full pl-3 text-left font-normal",
												!field.value && "text-muted-foreground"
											)}
											disabled={uploading}
										>
											{field.value ? (
												format(field.value, "PPP", { locale: es })
											) : (
												<span>Selecciona una fecha</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value || undefined}
										onSelect={field.onChange}
										disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
										initialFocus
										locale={es}
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-4">
					<FormLabel>Archivo</FormLabel>
					<Input
						type="file"
						disabled={uploading}
						onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
						accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .jpg, .jpeg, .png, .webp, .avif"
					/>
					{message && <p className="text-muted-foreground text-sm">{message}</p>}
				</div>

				<div className="flex gap-4">
					<Button type="submit" disabled={uploading}>
						{uploading ? "Actualizando..." : "Actualizar archivo"}
					</Button>
					{lastPath && (
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push(lastPath)}
							disabled={uploading}
						>
							Cancelar
						</Button>
					)}
				</div>
			</form>
		</Form>
	)
}
