"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { FilePlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"

import { addWorkPermitAttachment } from "../../actions/admin/addAttachment"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import { toast } from "sonner"
import {
	workPermitAttachmentSchema,
	type WorkPermitAttachmentSchema,
} from "../../schemas/work-permit-attachment.schema"

import SubmitButton from "@/shared/components/forms/SubmitButton"
import FileTable from "@/shared/components/forms/FileTable"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "@/shared/components/ui/dialog"

interface WorkPermitAttachmentFormProps {
	userId: string
	companyId: string
	workPermitId: string
}

export default function WorkPermitAttachmentForm({
	userId,
	companyId,
	workPermitId,
}: WorkPermitAttachmentFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<WorkPermitAttachmentSchema>({
		resolver: zodResolver(workPermitAttachmentSchema),
		defaultValues: {
			userId: userId,
			companyId: companyId,
			workPermitId: workPermitId,
		},
	})

	async function onSubmit(values: WorkPermitAttachmentSchema) {
		const uploadedFile = values.file[0]

		if (!uploadedFile) {
			toast("Error", {
				description: "Debe seleccionar un archivo",
				duration: 3000,
			})
			return
		}

		try {
			setIsSubmitting(true)

			const uploadResult = await uploadFilesToCloud({
				files: [uploadedFile],
				containerType: "files",
				nameStrategy: "original",
				randomString: workPermitId,
			})

			const res = await addWorkPermitAttachment(values, uploadResult[0])

			if (!res.ok) {
				toast("Error", {
					description: "Hubo un error al adjuntar el archivo",
					duration: 3000,
				})
				setIsSubmitting(false)
				return
			}

			toast.success("Archivo adjuntado", {
				description: "Archivo adjuntado exitosamente",
				duration: 3000,
			})

			queryClient.invalidateQueries({
				queryKey: ["workPermits"],
			})
		} catch (error) {
			setIsSubmitting(false)

			toast.error("Error", {
				description: `Hubo un error al adjuntar el archivo. ${error instanceof Error ? error.message : "Error desconocido"}`,
				duration: 3000,
			})
		}
	}

	useEffect(() => {
		console.log(form.formState.errors)
	}, [form.formState.errors])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant={"ghost"} className="cursor-pointer">
					<FilePlusIcon className="h-4 w-4 text-purple-500" />
					Adjuntar archivo
				</Button>
			</DialogTrigger>

			<DialogContent className="w-fit">
				<DialogHeader>
					<DialogTitle>Adjuntar archivo</DialogTitle>
					<DialogDescription>Adjunta un archivo para el permiso de trabajo.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
						<FileTable<WorkPermitAttachmentSchema>
							name="file"
							label="Archivo"
							isMultiple={false}
							control={form.control}
						/>

						<div className="flex w-full justify-end gap-2">
							<Button
								size={"lg"}
								variant="outline"
								className="mt-4 w-1/2"
								onClick={() => setOpen(false)}
							>
								Cancelar
							</Button>

							<SubmitButton
								label="Adjuntar"
								isSubmitting={isSubmitting}
								className="mt-4 w-1/2 bg-purple-500 hover:bg-purple-600 md:col-span-2"
							/>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
