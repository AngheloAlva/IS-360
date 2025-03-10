"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { addDays, format } from "date-fns"

import { workBookSchema } from "@/lib/form-schemas/work-book/work-book.schema"
import { createWorkBook } from "@/actions/work-books/createWorkBook"
import { updateWorkBook } from "@/actions/work-books/updateWorkBook"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"
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
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select"

import type { WorkBook } from "@prisma/client"
import type { z } from "zod"

interface WorkBookFormProps {
	workBook?: WorkBook & {
		otNumber: {
			otNumber: string
		}
	}
}

export default function WorkBookForm({ workBook }: WorkBookFormProps): React.ReactElement {
	const { data: session, isPending } = authClient.useSession()
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<z.infer<typeof workBookSchema>>({
		resolver: zodResolver(workBookSchema),
		defaultValues: {
			userId: session?.user.id,
			workName: workBook?.workName ?? "",
			workLocation: workBook?.workLocation ?? "",
			otNumber: workBook?.otNumber.otNumber ?? "",
			otcInspectorName: workBook?.otcInspectorName ?? "",
			workStartDate: workBook?.workStartDate ?? new Date(),
			otcInspectorPhone: workBook?.otcInspectorPhone ?? "",
			contractingCompany: workBook?.contractingCompany ?? "",
			workResponsibleName: workBook?.workResponsibleName ?? "",
			workResponsiblePhone: workBook?.workResponsiblePhone ?? "",
			workType: (workBook?.workType as "construccion") ?? undefined,
			workStatus: (workBook?.workStatus as "planificado") ?? undefined,
			workEstimatedEndDate: workBook?.workEstimatedEndDate ?? addDays(new Date(), 2),
		},
	})

	useEffect(() => {
		if (!isPending && session?.user) {
			form.setValue("userId", session?.user.id)
		}
	}, [form, isPending, session?.user])

	useEffect(() => {
		if (!workBook || !workBook.workLocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				form.setValue("workLocation", `${position.coords.latitude},${position.coords.longitude}`)
			})
		}
	}, [form, workBook])

	useEffect(() => {
		console.log(form.formState)
		console.log(form.formState.errors)
	}, [form.formState])

	async function onSubmit(values: z.infer<typeof workBookSchema>) {
		try {
			setLoading(true)

			if (!workBook) {
				const { ok, message, code } = await createWorkBook(values)

				if (!ok) {
					if (code === "P2002") {
						form.setError("otNumber", {
							message: "Ya existe un libro de obras con el mismo número de OT",
						})

						toast("Error al crear el registro", {
							description: "Ya existe un libro de obras con el mismo número de OT",
							duration: 5000,
						})

						return
					}

					toast("Error al crear el registro", {
						description: message,
						duration: 5000,
					})
				} else {
					toast("Registro creado", {
						description: message,
						duration: 5000,
					})

					router.push("/dashboard/libro-de-obras")
				}
			} else {
				const { ok, message } = await updateWorkBook(workBook.id, values)

				if (ok) {
					toast("Registro actualizado", {
						description: message,
						duration: 5000,
					})

					router.push(`/dashboard/libro-de-obras/${workBook.id}`)
				} else {
					toast("Error al actualizar el registro", {
						description: message,
						duration: 5000,
					})
				}
			}
		} catch (error) {
			console.error(error)

			toast("Ocurrió un error al intentar crear el registro", {
				description: (error as Error).message,
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
				className="grid w-full max-w-screen-lg gap-4 md:grid-cols-2"
			>
				<FormField
					control={form.control}
					name="otNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Numero de OT</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Numero de OT"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="workName"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Nombre de la Obra</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Nombre de la obra"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="workStartDate"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Fecha de Inicio</FormLabel>
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
					name="workEstimatedEndDate"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Fecha de Finalizacion</FormLabel>
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

				<div className="my-4 grid grid-cols-1 gap-4 border-y border-gray-200 py-4 md:col-span-2 md:grid-cols-2">
					<p className="text-gray-700 md:col-span-2">
						<strong>Responsable de la obra</strong>
					</p>

					<FormField
						control={form.control}
						name="workResponsibleName"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700">Nombre del Responsable</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Nombre"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="workResponsiblePhone"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700">Teléfono del Responsable</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Teléfono"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<p className="text-gray-700 md:col-span-2">
						<strong>Inspector OTC</strong>
					</p>

					<FormField
						control={form.control}
						name="otcInspectorName"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700">Nombre del Inspector</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Nombre"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="otcInspectorPhone"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700">Teléfono del Inspector</FormLabel>
								<FormControl>
									<Input
										className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
										placeholder="Teléfono"
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
					name="contractingCompany"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-gray-700">Empresa Contratista</FormLabel>
							<FormControl>
								<Input
									className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
									placeholder="Nombre de la empresa contratista"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="workStatus"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Estado</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700">
										<SelectValue placeholder="Selecciona el estado" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="planificado">Planificado</SelectItem>
									<SelectItem value="ejecucion">Ejecución</SelectItem>
									<SelectItem value="finalizado">Finalizado</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="workType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo de Obra</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="w-full overflow-hidden rounded-md border-gray-200 bg-white text-sm text-gray-700">
										<SelectValue placeholder="Selecciona el tipo de obra" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="construccion">Construcción</SelectItem>
									<SelectItem value="mantenimiento">Mantenimiento</SelectItem>
									<SelectItem value="ampliacion">Ampliación</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="workProgressStatus"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Estado del Avance</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="w-full overflow-hidden rounded-md border-gray-200 bg-white text-sm text-gray-700">
										<SelectValue placeholder="Selecciona el estado del avance" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="pendiente">Pendiente</SelectItem>
									<SelectItem value="proceso">Proceso</SelectItem>
									<SelectItem value="terminado">Terminado</SelectItem>
									<SelectItem value="postergado">Postergado</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

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
					) : workBook ? (
						"Actualizar Registro"
					) : (
						"Crear Registro"
					)}
				</Button>
			</form>
		</Form>
	)
}
