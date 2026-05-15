"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { PaperclipIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { updateSupportTicketStatus } from "@/project/support/actions/update-support-ticket-status"
import { addSupportTicketNote } from "@/project/support/actions/add-support-ticket-note"
import { SUPPORT_STATUS_OPTIONS } from "@/project/support/constants/support-ticket-meta"
import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { useSupportTicketById } from "@/project/support/hooks/use-support-tickets"
import { fileSchema } from "@/shared/schemas/file.schema"

import FileTable from "@/shared/components/forms/FileTable"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import {
	SupportPriorityBadge,
	SupportStatusBadge,
} from "@/project/support/components/ui/SupportBadges"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"

import { type SUPPORT_TICKET_STATUS as SupportTicketStatus } from "@/generated/prisma/enums"

const observationFormSchema = z.object({
	content: z.string().trim().min(2, "La observacion debe tener al menos 2 caracteres"),
	attachments: z.array(fileSchema).optional(),
})

type ObservationFormValues = z.infer<typeof observationFormSchema>

const statusFormSchema = z.object({
	note: z.string().trim().optional(),
	attachments: z.array(fileSchema).optional(),
})

type StatusFormValues = z.infer<typeof statusFormSchema>

interface SupportTicketDetailsSheetProps {
	ticketId: string | null
	open: boolean
	isAdmin: boolean
	onOpenChange: (open: boolean) => void
}

export default function SupportTicketDetailsSheet({
	ticketId,
	open,
	isAdmin,
	onOpenChange,
}: SupportTicketDetailsSheetProps) {
	const queryClient = useQueryClient()
	const { data: ticket, isLoading } = useSupportTicketById({
		id: ticketId || "",
		enabled: open && Boolean(ticketId),
	})

	const [updating, setUpdating] = useState(false)
	const [status, setStatus] = useState<SupportTicketStatus | "">("")

	const observationForm = useForm<ObservationFormValues>({
		resolver: zodResolver(observationFormSchema),
		defaultValues: { content: "", attachments: [] },
	})

	const statusForm = useForm<StatusFormValues>({
		resolver: zodResolver(statusFormSchema),
		defaultValues: { note: "", attachments: [] },
	})

	const handleViewDocument = async (url: string) => {
		const filename = extractFilenameFromUrl(url)
		if (!filename) {
			toast.error("Error: No se pudo obtener el nombre del archivo")
			return
		}

		await openDocumentSecurely(filename, "files")
	}

	const refreshData = async () => {
		await queryClient.invalidateQueries({ queryKey: ["supportTickets"] })
		if (ticketId) {
			await queryClient.invalidateQueries({ queryKey: ["supportTicket", ticketId] })
		}
	}

	const handleAddObservation = async (values: ObservationFormValues) => {
		if (!ticketId) return

		setUpdating(true)

		const filesToUpload = (values.attachments || []).filter((a) => a.file)
		const uploadedFiles =
			filesToUpload.length > 0
				? await uploadFilesToCloud({
						files: filesToUpload,
						containerType: "files",
						randomString: new Date().toISOString(),
					})
				: undefined

		const result = await addSupportTicketNote({
			ticketId,
			content: values.content,
			attachments: uploadedFiles,
		})

		if (result.error) {
			toast.error("Error", { description: result.error })
		} else {
			toast.success("Observacion agregada")
			observationForm.reset()
			await refreshData()
		}

		setUpdating(false)
	}

	const handleStatusUpdate = async (values: StatusFormValues) => {
		if (!ticketId || !status) {
			toast.error("Selecciona un estado")
			return
		}

		setUpdating(true)

		const filesToUpload = (values.attachments || []).filter((a) => a.file)
		const uploadedFiles =
			filesToUpload.length > 0
				? await uploadFilesToCloud({
						files: filesToUpload,
						containerType: "files",
						randomString: new Date().toISOString(),
					})
				: undefined

		const result = await updateSupportTicketStatus({
			ticketId,
			status,
			note: values.note?.trim() || undefined,
			attachments: uploadedFiles,
		})

		if (result.error) {
			toast.error("Error", { description: result.error })
		} else {
			toast.success("Estado actualizado")
			statusForm.reset()
			setStatus("")
			await refreshData()
		}

		setUpdating(false)
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full gap-0 sm:max-w-2xl">
				<SheetHeader className="border-b">
					<SheetTitle>
						{ticket ? `${ticket.ticketNumber} - ${ticket.title}` : "Detalle de ticket"}
					</SheetTitle>
					<SheetDescription>
						Gestion de estado, observaciones e historial del ticket.
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-4 overflow-y-auto p-4">
					{isLoading ? <p className="text-muted-foreground text-sm">Cargando detalle...</p> : null}

					{ticket ? (
						<>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="rounded-lg border p-3">
									<p className="text-muted-foreground text-xs">Estado</p>
									<div className="mt-1">
										<SupportStatusBadge status={ticket.status} />
									</div>
								</div>
								<div className="rounded-lg border p-3">
									<p className="text-muted-foreground text-xs">Prioridad</p>
									<div className="mt-1">
										<SupportPriorityBadge priority={ticket.priority} />
									</div>
								</div>
								<div className="rounded-lg border p-3 sm:col-span-2">
									<p className="text-muted-foreground text-xs">Solicitante</p>
									<p className="text-sm font-medium">{ticket.requester.name}</p>
									<p className="text-sm">{ticket.requester.email}</p>
									{ticket.requester.company ? (
										<p className="text-sm">Empresa: {ticket.requester.company.name}</p>
									) : null}
								</div>
							</div>

							<div className="rounded-lg border p-3">
								<p className="text-muted-foreground text-xs">Descripcion</p>
								<p className="mt-1 text-sm whitespace-pre-wrap">{ticket.description}</p>
							</div>

							{ticket.attachments?.length ? (
								<div className="space-y-2 rounded-lg border p-3">
									<p className="text-sm font-semibold">Capturas</p>
									<div className="space-y-2">
										{ticket.attachments.map((attachment) => (
											<button
												key={attachment.id}
												className="text-primary block text-sm underline"
												onClick={() => handleViewDocument(attachment.url)}
											>
												{attachment.name}
											</button>
										))}
									</div>
								</div>
							) : null}

							{isAdmin ? (
								<form
									onSubmit={statusForm.handleSubmit(handleStatusUpdate)}
									className="space-y-2 rounded-lg border p-3"
								>
									<p className="text-sm font-semibold">Actualizar estado</p>
									<Select
										value={status}
										onValueChange={(value) => setStatus(value as SupportTicketStatus)}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Selecciona estado" />
										</SelectTrigger>
										<SelectContent>
											{SUPPORT_STATUS_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Textarea
										{...statusForm.register("note")}
										placeholder="Observacion del cambio de estado (opcional)"
										className="min-h-24"
									/>
									<FileTable<StatusFormValues>
										name="attachments"
										control={statusForm.control}
										isMultiple
										label="Adjuntos (opcional)"
									/>
									<div className="flex justify-end">
										<Button type="submit" disabled={updating}>
											{updating ? "Guardando..." : "Actualizar estado"}
										</Button>
									</div>
								</form>
							) : null}

							<form
								onSubmit={observationForm.handleSubmit(handleAddObservation)}
								className="space-y-2 rounded-lg border p-3"
							>
								<p className="text-sm font-semibold">Agregar observacion</p>
								<Textarea
									{...observationForm.register("content")}
									placeholder="Escribe una observacion para este ticket"
									className="min-h-24"
								/>
								{observationForm.formState.errors.content ? (
									<p className="text-destructive text-xs">
										{observationForm.formState.errors.content.message}
									</p>
								) : null}
								<FileTable<ObservationFormValues>
									name="attachments"
									control={observationForm.control}
									isMultiple
									label="Adjuntos (opcional)"
								/>
								<div className="flex justify-end">
									<Button type="submit" disabled={updating}>
										{updating ? "Guardando..." : "Guardar observacion"}
									</Button>
								</div>
							</form>

							<div className="space-y-2 rounded-lg border p-3">
								<p className="text-sm font-semibold">Historial</p>
								{ticket.notes?.length ? (
									<div className="space-y-2">
										{ticket.notes.map((history) => (
											<div key={history.id} className="rounded-md border p-2">
												<p className="text-muted-foreground text-xs">
													{new Date(history.createdAt).toLocaleString("es-CL")}
												</p>
												<p className="text-sm font-medium">{history.user.name}</p>
												<p className="text-sm">{history.content}</p>
												{history.attachments?.length ? (
													<div className="mt-1 space-y-1">
														{history.attachments.map((att) => (
															<button
																key={att.id}
																type="button"
																className="text-primary flex items-center gap-1 text-sm underline"
																onClick={() => handleViewDocument(att.url)}
															>
																<PaperclipIcon className="size-3" />
																{att.name}
															</button>
														))}
													</div>
												) : null}
											</div>
										))}
									</div>
								) : (
									<p className="text-muted-foreground text-sm">Sin historial por ahora.</p>
								)}
							</div>
						</>
					) : null}
				</div>
			</SheetContent>
		</Sheet>
	)
}
