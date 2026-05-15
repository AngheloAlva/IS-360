"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
	AlertTriangleIcon,
	CheckCircle2Icon,
	CircleDashedIcon,
	CircleXIcon,
	FlagIcon,
	PlusIcon,
	type LucideIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { ModuleOptions } from "@/lib/consts/modules"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { createSupportTicket } from "@/project/support/actions/create-support-ticket"
import {
	SUPPORT_PRIORITY_OPTIONS,
	SUPPORT_TYPE_OPTIONS,
} from "@/project/support/constants/support-ticket-meta"
import {
	createSupportTicketSchema,
	type CreateSupportTicketSchema,
} from "@/project/support/schemas/support-ticket.schema"
import {
	SUPPORT_TICKET_PRIORITY,
	SUPPORT_TICKET_STATUS,
	type SUPPORT_TICKET_PRIORITY as SupportTicketPriority,
	type SUPPORT_TICKET_STATUS as SupportTicketStatus,
} from "@/generated/prisma/enums"

import FileTable from "@/shared/components/forms/FileTable"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select"

interface CreateSupportTicketDialogProps {
	buttonClassName?: string
}

const statusOptions: Array<{
	value: SupportTicketStatus
	label: string
	icon: LucideIcon
}> = [
	{ value: "REPORTED", label: "Reportado", icon: CircleDashedIcon },
	{ value: "IN_PROGRESS", label: "En proceso", icon: CircleDashedIcon },
	{ value: "RESOLVED", label: "Resuelto", icon: CheckCircle2Icon },
	{ value: "REJECTED", label: "Rechazado", icon: CircleXIcon },
]

export default function CreateSupportTicketDialog({
	buttonClassName,
}: CreateSupportTicketDialogProps) {
	const queryClient = useQueryClient()
	const [open, setOpen] = useState(false)
	const [submitting, setSubmitting] = useState(false)

	const moduleOptions = useMemo(() => ModuleOptions.filter((option) => option.value !== "ALL"), [])

	const form = useForm<CreateSupportTicketSchema>({
		resolver: zodResolver(createSupportTicketSchema),
		defaultValues: {
			title: "",
			type: "INCIDENT",
			priority: "MEDIUM",
			affectedModule: "NO_APLICA",
			description: "",
			attachments: [],
		},
	})

	const clearForm = () => {
		form.reset()
	}

	const onSubmit = async (values: CreateSupportTicketSchema) => {
		setSubmitting(true)
		try {
			const filesToUpload = (values.attachments || []).filter((attachment) => attachment.file)

			const uploadedFiles =
				filesToUpload.length > 0
					? await uploadFilesToCloud({
							files: filesToUpload,
							containerType: "files",
							randomString: new Date().toISOString(),
						})
					: undefined

			const result = await createSupportTicket({
				values: {
					title: values.title,
					type: values.type,
					priority: values.priority,
					affectedModule: values.affectedModule,
					description: values.description,
				},
				attachments: uploadedFiles,
			})

			if (result.error) {
				toast.error("Error", {
					description: result.error,
				})
				return
			}

			toast.success("Ticket creado", {
				description: "Tu ticket de soporte fue registrado correctamente.",
			})

			setOpen(false)
			clearForm()
			await queryClient.invalidateQueries({ queryKey: ["supportTickets"] })
		} catch (error) {
			console.error("[CREATE_SUPPORT_TICKET_DIALOG]", error)
			toast.error("Error", {
				description: "No se pudo crear el ticket de soporte",
			})
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className={buttonClassName || "bg-white text-slate-900 hover:bg-white/90"}>
					<PlusIcon className="size-4" /> Nuevo ticket
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Crear ticket de soporte</DialogTitle>
					<DialogDescription>
						Completa el formulario para registrar un nuevo ticket.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid grid-cols-1 gap-4 md:grid-cols-2"
					>
						<InputFormField<CreateSupportTicketSchema>
							name="title"
							control={form.control}
							label="Nombre del requerimiento"
							placeholder="Ej: Error al generar permiso"
						/>

						<FormField
							name="type"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tipo</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="h-9 w-full">
												<SelectValue placeholder="Seleccionar tipo" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{SUPPORT_TYPE_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="priority"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Prioridad</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="h-9 w-full">
												<SelectValue placeholder="Seleccionar prioridad" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{SUPPORT_PRIORITY_OPTIONS.map((option) => {
												const Icon =
													option.value === SUPPORT_TICKET_PRIORITY.HIGH
														? AlertTriangleIcon
														: FlagIcon
												const colorClassName =
													option.value === SUPPORT_TICKET_PRIORITY.HIGH
														? "text-red-600 dark:text-red-300"
														: option.value === SUPPORT_TICKET_PRIORITY.MEDIUM
															? "text-yellow-600 dark:text-yellow-300"
															: "text-blue-600 dark:text-blue-300"

												return (
													<SelectItem
														key={option.value}
														value={option.value}
														className={colorClassName}
													>
														<div className="flex items-center gap-2">
															<Icon className="size-4" />
															{option.label}
														</div>
													</SelectItem>
												)
											})}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel>Estado inicial</FormLabel>
							<Select value={SUPPORT_TICKET_STATUS.REPORTED} disabled>
								<FormControl>
									<SelectTrigger className="h-9 w-full">
										<SelectValue placeholder="Estado inicial" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{statusOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											<div className="flex items-center gap-2">
												<option.icon className="size-4" />
												{option.label}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormItem>

						<FormField
							name="affectedModule"
							control={form.control}
							render={({ field }) => (
								<FormItem className="md:col-span-2">
									<FormLabel>Modulo afectado (opcional)</FormLabel>
									<Select value={field.value || "NO_APLICA"} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="h-9 w-full">
												<SelectValue placeholder="Seleccionar modulo" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="NO_APLICA">No especificado</SelectItem>
											{moduleOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<TextAreaFormField<CreateSupportTicketSchema>
							name="description"
							control={form.control}
							label="Descripcion"
							itemClassName="md:col-span-2"
							className="min-h-28"
							placeholder="Describe el problema, pasos para reproducir y resultado esperado"
						/>

						<FileTable<CreateSupportTicketSchema>
							name="attachments"
							control={form.control}
							isMultiple
							className="md:col-span-2"
							label="Capturas (opcional)"
						/>

						<DialogFooter className="md:col-span-2">
							<Button variant="outline" onClick={clearForm} disabled={submitting} type="button">
								Limpiar
							</Button>
							<Button type="submit" disabled={submitting}>
								{submitting ? "Creando..." : "Crear ticket"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
