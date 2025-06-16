import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { uploadFilesToCloud } from "@/lib/upload-files"
import { DocumentCategory } from "@prisma/client"
import { createStartupFolderDocument } from "../actions/create-startup-folder-document"

const uploadDocumentSchema = z.object({
	file: z.instanceof(File, {
		message: "Por favor seleccione un archivo",
	}),
	expirationDate: z.date({
		required_error: "La fecha de vencimiento es obligatoria",
		invalid_type_error: "La fecha de vencimiento debe ser válida",
	}),
})

type UploadDocumentSchema = z.infer<typeof uploadDocumentSchema>

interface UploadSingleDocumentDialogProps {
	open: boolean
	onClose: () => void
	onUploadComplete?: () => void
	startupFolderId?: string
	workerId?: string
	vehicleId?: string
	userId: string
	category: DocumentCategory
	documentType: string
	documentName: string
}

export function UploadSingleDocumentDialog({
	open,
	onClose,
	onUploadComplete,
	startupFolderId,
	workerId,
	vehicleId,
	userId,
	category,
	documentType,
	documentName,
}: UploadSingleDocumentDialogProps) {
	const form = useForm<UploadDocumentSchema>({
		resolver: zodResolver(uploadDocumentSchema),
	})

	const onSubmit = async (data: UploadDocumentSchema) => {
		try {
			const uploadResult = await uploadFilesToCloud({
				files: [
					{
						file: data.file,
						type: data.file.type,
						url: "",
						preview: "",
						title: data.file.name,
						fileSize: data.file.size,
						mimeType: data.file.type,
					},
				],
				randomString: startupFolderId || workerId || vehicleId || "",
				containerType: "startup",
				nameStrategy: "original",
			})

			await createStartupFolderDocument({
				startupFolderId: startupFolderId!,
				documentType,
				documentName,
				category,
				expirationDate: data.expirationDate,
				url: uploadResult[0].url,
				userId,
				workerId,
				vehicleId,
			})

			toast.success("Documento subido exitosamente")
			onClose()
			onUploadComplete?.()
		} catch (error) {
			console.error(error)
			toast.error("Error al subir el documento")
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Subir documento: {documentName}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="file"
							render={({
								field: { onChange, ...field },
							}: {
								field: { onChange: (value: File) => void }
							}) => (
								<FormItem>
									<FormControl>
										<Input
											type="file"
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												const file = e.target.files?.[0]
												if (file) onChange(file)
											}}
											{...field}
											value={undefined}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DatePickerFormField
							control={form.control}
							name="expirationDate"
							label="Fecha de vencimiento"
							disabledCondition={(date: Date) => date < new Date()}
						/>

						<div className="flex justify-end gap-2">
							<Button variant="outline" type="button" onClick={onClose}>
								Cancelar
							</Button>
							<Button type="submit">Subir documento</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
