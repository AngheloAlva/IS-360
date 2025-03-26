"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { CalendarIcon, UploadIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"
import { z } from "zod"

import { dailyActivitySchema } from "@/lib/form-schemas/work-book/daily-activity.schema"
import { createActivity } from "@/actions/work-book-entries/createActivity"
import { getUsersByCompanyId } from "@/actions/users/getUsers"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger,
} from "@/components/ui/select"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
} from "@/components/ui/form"

import type { ENTRY_TYPE, User } from "@prisma/client"
import type { Session } from "@/lib/auth"

export default function ActivityForm({
	workOrderId,
	entryType,
	session,
}: {
	entryType: ENTRY_TYPE
	workOrderId: string
	session: Session
}): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

	const [loadingUsers, setLoadingUsers] = useState(false)
	const [users, setUsers] = useState<User[]>([])

	const router = useRouter()

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files

		if (files?.length) {
			setSelectedFiles(files)
			// form.setValue("attachments", files)
		}
	}

	const form = useForm<z.infer<typeof dailyActivitySchema>>({
		resolver: zodResolver(dailyActivitySchema),
		defaultValues: {
			activityEndTime: "",
			activityName: "",
			activityStartTime: "",
			comments: "",
			executionDate: new Date(),
			personnel: [
				{
					userId: "",
				},
				{
					userId: "",
				},
			],
			workOrderId,
		},
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "personnel",
	})

	useEffect(() => {
		console.log(form.formState)
		console.log(form.formState.errors)
	}, [form.formState])

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoadingUsers(true)

				const { data, ok } = await getUsersByCompanyId(session.user.companyId!)

				if (!ok || !data) {
					throw new Error("Error al cargar los usuarios")
				}

				setUsers(data)
			} catch (error) {
				console.error(error)
				toast("Error al cargar los usuarios", {
					description: "Ocurrió un error al intentar cargar los usuarios",
					duration: 5000,
				})
			} finally {
				setLoadingUsers(false)
			}
		}
		void fetchUsers()
	}, [session.user.companyId])

	async function onSubmit(values: z.infer<typeof dailyActivitySchema>) {
		try {
			setLoading(true)

			const { ok, message } = await createActivity({
				values,
				entryType,
				userId: session.user.id,
				// attachments: selectedFiles,
			})

			if (ok) {
				toast("Actividad creada", {
					description: message,
					duration: 5000,
				})

				router.push(`/dashboard/libro-de-obras/${workOrderId}`)
			} else {
				toast("Error al crear la actividad", {
					description: message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)
			toast("Error al crear la actividad", {
				description: "Ocurrió un error al intentar crear la actividad",
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
				className="grid w-full max-w-screen-xl gap-4 md:grid-cols-2"
			>
				<FormField
					control={form.control}
					name="activityName"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="">Nombre de la Actividad</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md text-sm"
									placeholder="Nombre de la Actividad"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex gap-2">
					<FormField
						control={form.control}
						name="executionDate"
						render={({ field }) => (
							<FormItem className="flex w-2/3 flex-col">
								<FormLabel>Fecha de Ejecución</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-full rounded-md bg-transparent pl-3 text-left text-sm font-normal",
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
						name="activityStartTime"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="">Hora de Inicio</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md text-sm"
										placeholder="Hora de Inicio"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="activityEndTime"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="">Hora de Fin</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md text-sm"
										placeholder="Hora de Fin"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="comments"
					render={({ field }) => (
						<FormItem className="md:col-span-2">
							<FormLabel className="">Comentarios</FormLabel>
							<FormControl>
								<Textarea
									className="min-h-32 w-full rounded-md text-sm"
									placeholder="Comentarios"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormLabel className="mt-4 md:col-span-2">Adjuntos</FormLabel>
				<div className="flex gap-2 md:col-span-2">
					<FormItem className="w-1/2">
						<FormControl>
							<div className="group relative h-96">
								<Input
									multiple
									type="file"
									onChange={handleFileChange}
									accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
									className="absolute inset-0 z-10 h-full w-full cursor-pointer rounded-md text-sm opacity-0"
								/>
								<div className="group-hover:border-feature group-hover:bg-feature/5 flex h-full flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white transition-colors">
									<UploadIcon className="group-hover:text-feature h-10 w-10 text-gray-400" />
									<p className="group-hover:text-feature mt-4 text-sm text-gray-500">
										Haz clic para seleccionar archivos
									</p>
									<p className="group-hover:text-feature mt-1 text-xs text-gray-400">
										Imágenes, PDF, DOC, XLS, TXT
									</p>
								</div>
							</div>
						</FormControl>
					</FormItem>

					<div className="border-input flex h-96 w-1/2 items-center justify-center rounded-md border bg-gray-50">
						{selectedFiles && (
							<p className="mt-2 text-sm text-gray-500">
								{selectedFiles.length} archivo{selectedFiles.length > 1 && "s"} seleccionado
							</p>
						)}
					</div>
				</div>

				<div className="my-6 grid gap-4 border-y py-4 md:col-span-2 md:grid-cols-2">
					{fields.map((field, index) => (
						<div key={field.id} className="grid grid-cols-1 gap-x-4">
							<div className="flex items-center justify-between gap-2">
								<h3 className="text-lg font-semibold text-gray-800">Personal #{index + 1}</h3>

								<Button
									type="button"
									onClick={() => remove(index)}
									className="mt-2 bg-transparent md:col-span-2"
									variant="outline"
								>
									Eliminar #{index + 1}
								</Button>
							</div>

							{loadingUsers ? (
								<Skeleton className="h-9 w-full rounded-md" />
							) : (
								<FormField
									control={form.control}
									name={`personnel.${index}.userId`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="">Nombre del Personal</FormLabel>

											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="">
														<SelectValue placeholder="Seleccione al personal" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="text-neutral-700">
													{users.map((user) => (
														<SelectItem key={user.id} value={user.id}>
															{user.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>
					))}

					<Button
						size={"lg"}
						type="button"
						variant={"secondary"}
						onClick={() => append({ userId: "" })}
						className="mt-4 w-full md:col-span-2"
					>
						Añadir nuevo Personal
					</Button>
				</div>

				<Button className="mt-4 md:col-span-2" type="submit" size={"lg"} disabled={loading}>
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
						"Crear registro"
					)}
				</Button>
			</form>
		</Form>
	)
}
