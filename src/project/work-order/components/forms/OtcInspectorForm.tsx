"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { createOtcInspections } from "@/project/work-order/actions/createOtcInspections"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import {
	otcInspectionsSchema,
	type OtcInspectionSchema,
} from "@/project/work-order/schemas/otc-inspections.schema"

import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import FileTable from "@/shared/components/forms/FileTable"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

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
			nonConformities: "",
			activityEndTime: "",
			activityStartTime: "",
			safetyObservations: "",
			supervisionComments: "",
			executionDate: new Date(),
		},
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
				className="flex h-10 items-center justify-center gap-1 rounded-md bg-red-500 px-3 text-sm font-semibold text-nowrap text-white hover:bg-red-500/80"
				onClick={() => setOpen(true)}
			>
				<PlusIcon className="h-4 w-4" />
				<span className="hidden sm:inline">Inspección OTC</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-xl">
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
						<DatePickerFormField<OtcInspectionSchema>
							name="executionDate"
							control={form.control}
							label="Fecha de Ejecución"
						/>

						<div className="grid gap-3 md:grid-cols-2">
							<InputFormField<OtcInspectionSchema>
								name="activityStartTime"
								control={form.control}
								label="Hora de Inicio"
							/>

							<InputFormField<OtcInspectionSchema>
								name="activityEndTime"
								control={form.control}
								label="Hora de Fin"
							/>
						</div>

						<TextAreaFormField<OtcInspectionSchema>
							name="nonConformities"
							control={form.control}
							label="No Conformidades"
							itemClassName="sm:col-span-2"
						/>

						<TextAreaFormField<OtcInspectionSchema>
							control={form.control}
							name="supervisionComments"
							itemClassName="sm:col-span-2"
							label="Comentarios de Supervisión"
						/>

						<TextAreaFormField<OtcInspectionSchema>
							control={form.control}
							name="safetyObservations"
							itemClassName="sm:col-span-2"
							label="Observaciones de Seguridad"
						/>

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
							className="sm:col-span-2"
							isSubmitting={isSubmitting}
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
