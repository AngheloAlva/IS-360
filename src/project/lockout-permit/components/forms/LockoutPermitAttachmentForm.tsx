"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { FilePlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { addLockoutPermitAttachment } from "../../actions/admin/addAttachment"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { queryClient } from "@/lib/queryClient"
import {
	lockoutPermitAttachmentFormSchema,
	type LockoutPermitAttachmentFormSchema,
} from "../../schemas/lockout-permit-attachment-form.schema"

import SubmitButton from "@/shared/components/forms/SubmitButton"
import FileTable from "@/shared/components/forms/FileTable"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

interface LockoutPermitAttachmentFormProps {
	userId: string
	companyId: string
	lockoutPermitId: string
}

export default function LockoutPermitAttachmentForm({
	userId,
	companyId,
	lockoutPermitId,
}: LockoutPermitAttachmentFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<LockoutPermitAttachmentFormSchema>({
		resolver: zodResolver(lockoutPermitAttachmentFormSchema),
		defaultValues: {
			userId: userId,
			companyId: companyId,
			lockoutPermitId: lockoutPermitId,
		},
	})

	async function onSubmit(values: LockoutPermitAttachmentFormSchema) {
		const uploadedFile = values.file[0]

		if (!uploadedFile) {
			toast("Error", {
				description: "Debe seleccionar un archivo",
				duration: 3000,
			})
			return
		}

		setIsSubmitting(true)

		try {
			const uploadResult = await uploadFilesToCloud({
				files: [uploadedFile],
				randomString: Math.random().toString(36).substring(7),
				containerType: "documents",
			})

			if (uploadResult.length === 0) {
				toast.error("Error al subir el archivo")
				return
			}

			const result = await addLockoutPermitAttachment(
				{
					userId: values.userId,
					companyId: values.companyId,
					lockoutPermitId: values.lockoutPermitId,
				},
				uploadResult[0]
			)

			if (result.ok) {
				toast.success(result.message)
				form.reset()
				setOpen(false)
				await queryClient.invalidateQueries({ queryKey: ["lockout-permits"] })
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error("Error uploading file:", error)
			toast.error("Error al subir el archivo")
		} finally {
			setIsSubmitting(false)
		}
	}

	useEffect(() => {
		if (!open) {
			form.reset()
		}
	}, [open, form])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-3 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
				<FilePlusIcon className="h-4 w-4" />
				Adjuntar Archivo
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Adjuntar Documento</DialogTitle>
					<DialogDescription>
						Sube un archivo relacionado con este permiso de bloqueo. Se permiten archivos PDF, JPG,
						PNG y DOCX de hasta 10MB.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FileTable
							control={form.control}
							name="file"
							label="Archivo"
							isMultiple={false}
							maxFileSize={10 * 1024 * 1024} // 10MB
							acceptedFileTypes={/\.(pdf|jpe?g|png|docx)$/i}
						/>

						<div className="flex justify-end gap-2">
							<Button
								size="lg"
								type="button"
								variant="outline"
								className="w-1/3"
								disabled={isSubmitting}
								onClick={() => setOpen(false)}
							>
								Cancelar
							</Button>

							<SubmitButton
								label="Adjuntar Archivo"
								isSubmitting={isSubmitting}
								className="w-2/3 bg-lime-500 hover:bg-lime-600 hover:text-white"
							/>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
