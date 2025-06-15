"use client"

import { PlusCircleIcon, PlusIcon, TrashIcon } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useWorkBookMilestones } from "@/project/work-order/hooks/use-work-book-milestones"
import { createActivity } from "@/project/work-order/actions/createActivity"
import { getUsersByWorkOrderId } from "@/project/user/actions/getUsers"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	type DailyActivitySchema,
	dailyActivitySchema,
} from "@/project/work-order/schemas/daily-activity.schema"

import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TimePickerFormField } from "@/shared/components/forms/TimePickerFormField"
import UploadFilesFormField from "@/shared/components/forms/UploadFilesFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Form, FormLabel } from "@/shared/components/ui/form"
import { Separator } from "@/shared/components/ui/separator"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

import type { ENTRY_TYPE, User } from "@prisma/client"

export default function ActivityForm({
	userId,
	startDate,
	entryType,
	workOrderId,
}: {
	userId: string
	startDate: Date
	workOrderId: string
	entryType: ENTRY_TYPE
}): React.ReactElement {
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [users, setUsers] = useState<User[]>([])

	const [open, setOpen] = useState(false)

	const { data: milestones, isLoading: isLoadingMilestones } = useWorkBookMilestones({
		workOrderId,
		showAll: false,
	})

	const form = useForm<DailyActivitySchema>({
		resolver: zodResolver(dailyActivitySchema),
		defaultValues: {
			workOrderId,
			comments: "",
			activityName: "",
			activityEndTime: "",
			activityStartTime: "",
			executionDate: startDate,
			personnel: [
				{
					userId: "",
				},
				{
					userId: "",
				},
			],
		},
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "personnel",
	})

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const { data, ok } = await getUsersByWorkOrderId(workOrderId)

				if (!ok || !data) {
					throw new Error("Error al cargar los usuarios")
				}

				setUsers(data)
			} catch (error) {
				console.error(error)
				toast.error("Error al cargar los usuarios", {
					description: "Ocurrió un error al intentar cargar los usuarios",
					duration: 5000,
				})
			}
		}

		void fetchUsers()
	}, [workOrderId])

	async function onSubmit(values: DailyActivitySchema) {
		setIsSubmitting(true)

		const files = form.getValues("files")

		if (!values.personnel.length) {
			toast.error("Debe haber al menos un personal")
			return
		}

		try {
			if (files && files.length > 0) {
				const uploadResults = await uploadFilesToCloud({
					files,
					randomString: userId,
					containerType: "files",
					secondaryName: values.activityName,
				})

				const { ok, message } = await createActivity({
					values: {
						...values,
						files: undefined,
					},
					userId,
					entryType,
					attachment: uploadResults,
				})

				if (!ok) throw new Error(message)
			} else {
				const { ok, message } = await createActivity({
					values: {
						...values,
						files: undefined,
					},
					userId,
					entryType,
				})

				if (!ok) throw new Error(message)
			}

			toast.success("Actividad creada correctamente")

			setOpen(false)
			form.reset()

			queryClient.invalidateQueries({
				queryKey: ["work-entries", { workOrderId }],
			})
			queryClient.invalidateQueries({
				queryKey: ["workBookMilestones", { workOrderId, showAll: true }],
			})
		} catch (error) {
			console.error(error)
			toast.error("Error al crear actividad", {
				description: error instanceof Error ? error.message : "Intente nuevamente",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className={cn(
					"flex h-10 items-center justify-center gap-1 rounded-md bg-orange-600 px-3 text-sm font-semibold text-nowrap text-white transition-all hover:scale-105 hover:bg-orange-700",
					{
						"bg-yellow-600 hover:bg-yellow-700": entryType === "ADDITIONAL_ACTIVITY",
					}
				)}
				onClick={() => setOpen(true)}
			>
				<PlusIcon className="h-4 w-4" />
				<span className="hidden sm:inline">
					{entryType === "DAILY_ACTIVITY" ? "Actividad Diaria" : "Actividad Adicional"}
				</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-xl">
				<SheetHeader className="shadow">
					<SheetTitle>
						{entryType === "DAILY_ACTIVITY"
							? "Nueva Actividad Diaria"
							: "Nueva Actividad Adicional"}
					</SheetTitle>
					<SheetDescription>
						Complete la información en el formulario para crear una nueva{" "}
						{entryType === "DAILY_ACTIVITY" ? "actividad diaria" : "actividad adicional"}.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid w-full gap-x-3 gap-y-5 overflow-y-scroll px-4 pt-4 pb-16 sm:grid-cols-2"
					>
						<InputFormField<DailyActivitySchema>
							name="activityName"
							control={form.control}
							label="Nombre de la Actividad"
							placeholder="Nombre de la Actividad"
							itemClassName="sm:col-span-1"
						/>

						<DatePickerFormField<DailyActivitySchema>
							name="executionDate"
							control={form.control}
							label="Fecha de Ejecución"
							itemClassName="sm:col-span-1"
							disabledCondition={(date) => date < startDate}
						/>

						<TimePickerFormField<DailyActivitySchema>
							control={form.control}
							label="Hora de Inicio"
							name="activityStartTime"
							itemClassName="content-start"
						/>

						<TimePickerFormField<DailyActivitySchema>
							name="activityEndTime"
							control={form.control}
							label="Hora de Fin"
							itemClassName="content-start"
						/>

						{isLoadingMilestones ? (
							<Skeleton className="h-10 w-full rounded-md sm:col-span-2" />
						) : (
							<SelectFormField<DailyActivitySchema>
								options={
									milestones?.milestones.map((milestone) => ({
										value: milestone.id,
										label: milestone.name,
									})) || []
								}
								name="milestoneId"
								control={form.control}
								label="Hito Relacionado"
								placeholder="Selecciona un hito"
								itemClassName="sm:col-span-2 mt-2"
								description="Selecciona un hito para relacionar la actividad con un hito específico."
							/>
						)}

						<TextAreaFormField<DailyActivitySchema>
							name="comments"
							className="h-32"
							label="Comentarios"
							control={form.control}
							itemClassName="sm:col-span-2"
						/>

						<Separator className="my-4 sm:col-span-2" />

						<div className="sm:col-span-2">
							<h2 className="text-lg font-bold">Archivos</h2>
							<p className="text-muted-foreground text-sm">
								Puede adjuntar cualquier archivo relacionado con la actividad realizada.
							</p>
						</div>

						<UploadFilesFormField<DailyActivitySchema>
							name="files"
							isMultiple={true}
							maxFileSize={500}
							className="hidden"
							control={form.control}
							selectedFileIndex={selectedFileIndex}
							containerClassName="w-full sm:col-span-2"
							setSelectedFileIndex={setSelectedFileIndex}
						/>

						<Separator className="my-4 sm:col-span-2" />

						<div className="flex flex-col sm:col-span-2">
							<h2 className="text-lg font-bold">Personal que participa en la actividad</h2>
							<span className="text-muted-foreground text-sm">
								Las opciones disponibles son los trabajadores que se registraron en el permiso de
								trabajo
							</span>
						</div>

						{fields.map((field, index) => (
							<div key={field.id} className="grid">
								<div className="flex items-center justify-between gap-2">
									<FormLabel className="text-base">Personal #{index + 1}</FormLabel>

									<Button
										size={"sm"}
										type="button"
										variant="ghost"
										onClick={() => remove(index)}
										className="text-red-500 hover:bg-transparent"
									>
										<TrashIcon />
									</Button>
								</div>

								<SelectFormField<DailyActivitySchema>
									options={users.map((user) => ({
										value: user.id,
										label: user.name,
									}))}
									control={form.control}
									name={`personnel.${index}.userId`}
									placeholder="Seleccione al personal"
								/>
							</div>
						))}

						<Button
							type="button"
							variant={"ghost"}
							onClick={() => append({ userId: "" })}
							className="text-primary w-fit justify-start hover:cursor-pointer hover:bg-transparent hover:underline sm:col-span-2"
						>
							<PlusCircleIcon className="mr-1" />
							Añadir Personal
						</Button>

						<SubmitButton
							label="Crear actividad"
							isSubmitting={isSubmitting}
							className="hover:bg-primary/80 sm:col-span-2"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
