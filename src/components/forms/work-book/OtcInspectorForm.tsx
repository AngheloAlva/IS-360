"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"
import { z } from "zod"

import { otcInspectionsSchema } from "@/lib/form-schemas/work-book/otc-inspections.schema"
import { createOtcInspections } from "@/actions/otc-inspections/createOtcInspections"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
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

export default function OtcInspectorForm({
	workBookId,
}: {
	workBookId: string
}): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

	const router = useRouter()

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files

		if (files?.length) {
			setSelectedFiles(files)
			// form.setValue("attachments", files)
		}
	}

	const form = useForm<z.infer<typeof otcInspectionsSchema>>({
		resolver: zodResolver(otcInspectionsSchema),
		defaultValues: {
			workBookId,
			inspectorName: "",
			nonConformities: "",
			activityEndTime: "",
			activityStartTime: "",
			safetyObservations: "",
			supervisionComments: "",
			dateOfExecution: new Date(),
		},
	})

	useEffect(() => {
		console.log(form.formState)
		console.log(form.formState.errors)
	}, [form.formState])

	async function onSubmit(values: z.infer<typeof otcInspectionsSchema>) {
		try {
			setLoading(true)

			const { ok, message } = await createOtcInspections(values)

			if (ok) {
				toast("Actividad del Inspector creado", {
					description: message,
					duration: 5000,
				})

				router.push(`/dashboard/libro-de-obras/${workBookId}`)
			} else {
				toast("Error al crear la actividad del Inspector", {
					description: message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)
			toast("Error al crear la actividad del Inspector", {
				description: "Ocurrió un error al intentar crear la actividad del Inspector",
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
				className="mx-auto grid w-full max-w-screen-xl gap-4 md:grid-cols-2"
			>
				<FormField
					control={form.control}
					name="inspectorName"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Nombre del Inspector</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Nombre del Inspector"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="dateOfExecution"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Fecha de Ejecución</FormLabel>
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
					name="activityStartTime"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Hora de Inicio</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
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
							<FormLabel className="text-gray-700">Hora de Fin</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Hora de Fin"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="supervisionComments"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Comentarios de Supervisión</FormLabel>
							<FormControl>
								<Textarea
									className="min-h-32 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Comentarios"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="safetyObservations"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Observaciones de Seguridad</FormLabel>
							<FormControl>
								<Textarea
									className="min-h-32 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Observaciones"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="nonConformities"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">No Conformidades</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="No Conformidades"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormItem>
					<FormLabel className="text-gray-700">Adjuntos</FormLabel>
					<FormControl>
						<Input
							multiple
							type="file"
							onChange={handleFileChange}
							className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-gray-700 hover:file:bg-gray-200"
							accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
						/>
					</FormControl>
					{selectedFiles && (
						<p className="text-sm text-gray-500">
							{selectedFiles.length} archivo{selectedFiles.length > 1 && "s"} seleccionado
						</p>
					)}
				</FormItem>

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
