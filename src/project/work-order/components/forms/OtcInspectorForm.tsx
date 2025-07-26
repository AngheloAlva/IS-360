"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { MinusCircleIcon, PlusCircleIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { createOtcInspections } from "@/project/work-order/actions/createOtcInspections"
import { InspectionTypeOptions, InspectionType } from "../../const/inspection-type"
import { useWorkBookMilestones } from "../../hooks/use-work-book-milestones"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import {
	otcInspectionsSchema,
	type OtcInspectionSchema,
} from "@/project/work-order/schemas/otc-inspections.schema"

import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TimePickerFormField } from "@/shared/components/forms/TimePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import FileTable from "@/shared/components/forms/FileTable"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

type InspectionTypeValue = (typeof InspectionType)[number]

export default function OtcInspectorForm({
	userId,
	workOrderId,
}: {
	userId: string
	workOrderId: string
}): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<OtcInspectionSchema>({
		resolver: zodResolver(otcInspectionsSchema),
		defaultValues: {
			workOrderId,
			inspectionName: "",
			activityEndTime: new Date().toLocaleTimeString("en-US", {
				hour12: false,
				hour: "2-digit",
				minute: "2-digit",
			}),
			activityStartTime: new Date().toLocaleTimeString("en-US", {
				hour12: false,
				hour: "2-digit",
				minute: "2-digit",
			}),
			milestoneId: undefined,
			executionDate: new Date(),
			inspections: [
				{
					inspection: "",
					type: "NO_CONFORMITY",
				},
			],
		},
	})

	const { data: milestones, isLoading: isLoadingMilestones } = useWorkBookMilestones({
		workOrderId,
		showAll: false,
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "inspections",
	})

	async function onSubmit(values: OtcInspectionSchema) {
		setIsSubmitting(true)

		const files = form.getValues("files")

		try {
			if (files && files.length > 0) {
				const uploadResults = await uploadFilesToCloud({
					files,
					containerType: "files",
					secondaryName: "Inspeccion-",
					randomString: workOrderId.slice(0, 4),
				})

				const { ok, message } = await createOtcInspections({
					values: {
						...values,
						files: undefined,
					},
					userId,
					attachment: uploadResults,
				})

				if (!ok) throw new Error(message)
			} else {
				const { ok, message } = await createOtcInspections({
					values: {
						...values,
						files: undefined,
					},
					userId,
				})

				if (!ok) throw new Error(message)
			}

			toast.success("Inspección creada correctamente")

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
			toast.error("Error al crear inspección", {
				description: error instanceof Error ? error.message : "Intente nuevamente",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="flex h-9 items-center justify-center gap-1 rounded-md bg-red-500 px-3 text-sm font-semibold text-nowrap text-white hover:bg-red-500/80"
				onClick={() => setOpen(true)}
			>
				<PlusIcon className="h-4 w-4" />
				<span className="hidden sm:inline">Inspección OTC</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-fit">
				<SheetHeader className="shadow">
					<SheetTitle>Inspección OTC</SheetTitle>
					<SheetDescription>
						Complete la información en el formulario para crear una nueva inspección OTC.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid w-full gap-x-3 gap-y-5 overflow-y-scroll px-4 pt-4 pb-16 sm:grid-cols-2"
					>
						<InputFormField<OtcInspectionSchema>
							name="inspectionName"
							control={form.control}
							label="Nombre de la Inspección"
							itemClassName="sm:col-span-2"
						/>

						<DatePickerFormField<OtcInspectionSchema>
							name="executionDate"
							control={form.control}
							label="Fecha de Ejecución"
						/>

						<div className="grid gap-3 overflow-hidden md:grid-cols-2">
							<TimePickerFormField<OtcInspectionSchema>
								name="activityStartTime"
								control={form.control}
								label="Hora de Inicio"
							/>

							<TimePickerFormField<OtcInspectionSchema>
								label="Hora de Fin"
								name="activityEndTime"
								control={form.control}
							/>
						</div>

						{isLoadingMilestones ? (
							<Skeleton className="h-10 w-full rounded-md sm:col-span-2" />
						) : (
							<SelectFormField<OtcInspectionSchema>
								optional
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
								description="Selecciona un hito para relacionar la inspección con un hito específico."
							/>
						)}

						<Separator className="sm:col-span-2" />

						<div className="flex items-center justify-between gap-4 sm:col-span-2">
							<div>
								<h2 className="text-lg font-bold">Inspecciones</h2>
								<p className="text-muted-foreground text-sm">
									Selecciona el tipo de inspección y proporciona una observación.
								</p>
							</div>

							{fields.length < 3 && (
								<Button
									type="button"
									variant={"ghost"}
									className="text-orange-500"
									disabled={fields.length >= 3 || fields.length >= InspectionTypeOptions.length}
									onClick={() => {
										const selectedTypes = fields.map((field) => field.type)
										const availableType =
											InspectionTypeOptions.find(
												(option) => !selectedTypes.includes(option.value as InspectionTypeValue)
											)?.value || "NO_CONFORMITY"

										append({ type: availableType as InspectionTypeValue, inspection: "" })
									}}
								>
									<PlusCircleIcon /> Inspección
								</Button>
							)}
						</div>

						{fields.map((field, index) => (
							<div className="flex flex-col gap-4 sm:col-span-2" key={field.id}>
								<div className="flex items-center justify-between">
									<h3 className="font-bold">Inspección {index + 1}</h3>
									{index !== 0 && (
										<Button
											type="button"
											variant={"ghost"}
											className="text-red-500"
											onClick={() => remove(index)}
										>
											<MinusCircleIcon /> Eliminar
										</Button>
									)}
								</div>

								<SelectFormField<OtcInspectionSchema>
									control={form.control}
									label="Tipo de Inspección"
									options={InspectionTypeOptions.filter((option) => {
										const selectedTypes = fields
											.filter((_, fieldIndex) => fieldIndex !== index)
											.map((field) => field.type as typeof option.value)
										return !selectedTypes.includes(option.value)
									})}
									name={`inspections.${index}.type`}
								/>

								<TextAreaFormField<OtcInspectionSchema>
									label="Observación"
									control={form.control}
									name={`inspections.${index}.inspection`}
								/>
							</div>
						))}

						<Separator className="my-4 sm:col-span-2" />

						<div className="sm:col-span-2">
							<h2 className="text-lg font-bold">Archivos</h2>
							<p className="text-muted-foreground text-sm">
								Puede adjuntar cualquier archivo relacionado con la inspección realizada.
							</p>
						</div>

						<FileTable<OtcInspectionSchema>
							name="files"
							isMultiple={true}
							maxFileSize={500}
							control={form.control}
							className="w-full sm:col-span-2"
						/>

						<SubmitButton
							label="Crear Inspección"
							isSubmitting={isSubmitting}
							className="bg-red-500 text-white hover:bg-red-600 hover:text-white sm:col-span-2"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
