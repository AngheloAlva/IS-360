"use client"

import { PlusCircleIcon, PlusIcon, TrashIcon } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useWorkBookMilestones } from "@/hooks/work-orders/use-work-book-milestones"
import { createActivity } from "@/actions/work-book-entries/createActivity"
import { getUsersByWorkOrderId } from "@/actions/users/getUsers"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	type DailyActivitySchema,
	dailyActivitySchema,
} from "@/lib/form-schemas/work-book/daily-activity.schema"

import { TimePickerFormField } from "@/components/forms/shared/TimePickerFormField"
import { DatePickerFormField } from "@/components/forms/shared/DatePickerFormField"
import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import UploadFilesFormField from "../shared/UploadFilesFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Form, FormLabel } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

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
	const [loadingUsers, setLoadingUsers] = useState(false)
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
				setLoadingUsers(true)

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
			} finally {
				setLoadingUsers(false)
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
					"bg-primary hover:bg-primary/80 flex h-10 items-center justify-center gap-1 rounded-md px-3 text-sm text-white",
					{
						"bg-green-500 hover:bg-green-500/80": entryType === "ADDITIONAL_ACTIVITY",
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

						<div className="flex items-center justify-between gap-2 sm:col-span-2">
							<h2 className="text-lg font-bold">Personal que participa en la actividad</h2>

							<Button
								type="button"
								variant={"ghost"}
								onClick={() => append({ userId: "" })}
								className="text-primary"
							>
								<PlusCircleIcon className="mr-1" />
								Añadir Personal
							</Button>
						</div>

						{fields.map((field, index) => (
							<div key={field.id} className="grid">
								<div className="flex items-center justify-between gap-2">
									<FormLabel className="text-base">Personal #{index + 1}</FormLabel>

									<Button
										size={"sm"}
										type="button"
										variant="ghost"
										className="text-red-500"
										onClick={() => remove(index)}
									>
										<TrashIcon />
									</Button>
								</div>

								{loadingUsers ? (
									<Skeleton className="h-9 w-full rounded-md" />
								) : (
									<SelectFormField<DailyActivitySchema>
										options={users.map((user) => ({
											value: user.id,
											label: user.name,
										}))}
										control={form.control}
										name={`personnel.${index}.userId`}
										placeholder="Seleccione al personal"
									/>
								)}
							</div>
						))}

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
