"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"

import { uploadFile } from "@/actions/document-management/uploadFile"
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
import { Codes } from "@/lib/consts/codes"
import { Areas } from "@/lib/consts/areas"

interface NewFileFormProps {
	area: string
	userId: string
	folderId?: string
}

export function NewFileForm({ userId, folderId, area }: NewFileFormProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [uploading, setUploading] = useState(false)
	const [message, setMessage] = useState("")

	const router = useRouter()

	const form = useForm<FileFormSchema>({
		resolver: zodResolver(fileFormSchema),
		defaultValues: {
			userId,
			name: "",
			folderId,
			description: "",
			expirationDate: undefined,
			registrationDate: new Date(),
		},
	})

	const onSubmit = async (values: FileFormSchema) => {
		if (!selectedFile) return

		setUploading(true)
		setMessage("Subiendo documento...")

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

					const saveResult = await uploadFile(
						values,
						`${process.env.NEXT_PUBLIC_S3_URL}/${uniqueFilename}`,
						fileSize,
						fileType
					)
					if (!saveResult.ok) {
						throw new Error("Error al guardar el documento en la base de datos")
					}

					setMessage("Documento subido correctamente")
					setSelectedFile(null)

					toast("Documento subido correctamente", {
						description: "El documento se ha subido correctamente",
						duration: 3000,
					})
					router.push(
						`/dashboard/documentacion/${Object.keys(Areas).find((key) => Areas[key as keyof typeof Areas] === area)}`
					)
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

	useEffect(() => {
		console.log(form.getValues())
	}, [form])

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Nombre del documento</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Nombre del documento"
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
							<FormLabel className="text-gray-700">
								Descripción
								<span className="text-muted-foreground text-xs">(opcional)</span>
							</FormLabel>
							<FormControl>
								<Textarea
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Descripción"
									{...field}
								/>
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

				<FormItem>
					<FormLabel className="text-gray-700">Archivo</FormLabel>
					<FormControl>
						<Input
							type="file"
							accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .jpg, .jpeg, .png, .webp, .avif"
							className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
							onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>

				<FormField
					control={form.control}
					name="registrationDate"
					render={({ field }) => (
						<FormItem className="flex flex-col gap-1">
							<FormLabel>Fecha de Registro</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full rounded-md border-gray-200 bg-white pl-3 text-left text-sm font-normal text-gray-700",
												!field.value && "text-muted-foreground"
											)}
										>
											{field.value ? (
												format(field.value, "PPP", { locale: es })
											) : (
												<span>Selecciona la fecha</span>
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
										disabled={(date) => date < new Date("1900-01-01")}
										initialFocus
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
						<FormItem className="flex flex-col gap-1">
							<FormLabel>
								Fecha de Expiracion
								<span className="text-muted-foreground text-xs">(opcional)</span>
							</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full rounded-md border-gray-200 bg-white pl-3 text-left text-sm font-normal text-gray-700",
												!field.value && "text-muted-foreground"
											)}
										>
											{field.value ? (
												format(field.value, "PPP", { locale: es })
											) : (
												<span>Selecciona la fecha</span>
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
										disabled={(date) => date < new Date("1900-01-01")}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={uploading || !selectedFile}>
					{uploading ? "Subiendo..." : "Subir documento"}
				</Button>

				{message && <p className="text-muted-foreground text-sm">{message}</p>}
			</form>
		</Form>
	)
}
