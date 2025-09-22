"use client"
import { ExternalLink, FileText, User, MessageSquareTextIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { getImageProps } from "next/image"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { createInspectionComment } from "@/project/work-order/actions/createInspectionComment"
import { useInspectionComments } from "@/project/work-order/hooks/use-inspection-comments"
import { WorkEntry } from "@/project/work-order/hooks/use-work-entries"
import { INSPECTION_COMMENT_TYPE } from "@prisma/client"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import {
	inspectionCommentSchema,
	type InspectionCommentSchema,
} from "@/project/work-order/schemas/inspection-comment.schema"

import { Sheet, SheetTitle, SheetHeader, SheetContent } from "@/shared/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import FileTable from "@/shared/components/forms/FileTable"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import Spinner from "@/shared/components/Spinner"
import { Form } from "@/shared/components/ui/form"

interface WorkBookEntryDetailsProps {
	isLoading: boolean
	onClose: () => void
	entry: WorkEntry
	userId?: string
	isOtcMember: boolean
}

const commentTypeLabels = {
	SUPERVISOR_RESPONSE: "Respuesta",
	RESPONSIBLE_APPROVAL: "Aprobación",
	RESPONSIBLE_REJECTION: "Rechazo",
}

const commentTypeColors = {
	SUPERVISOR_RESPONSE: "bg-blue-500/10 text-blue-500 border-blue-500",
	RESPONSIBLE_APPROVAL: "bg-green-500/10 text-green-500 border-green-500",
	RESPONSIBLE_REJECTION: "bg-red-500/10 text-red-500 border-red-500",
}

export function WorkBookEntryDetails({
	entry,
	userId,
	onClose,
	isLoading,
	isOtcMember,
}: WorkBookEntryDetailsProps) {
	const queryClient = useQueryClient()
	const [commentType, setCommentType] = useState<INSPECTION_COMMENT_TYPE | null>(
		!isOtcMember ? "SUPERVISOR_RESPONSE" : null
	)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [loadingAttachments, setLoadingAttachments] = useState<Record<string, boolean>>({})

	const handleViewAttachment = async (url: string, attachmentId: string) => {
		const filename = extractFilenameFromUrl(url)
		if (!filename) {
			toast.error("No se pudo determinar el nombre del archivo")
			return
		}

		setLoadingAttachments((prev) => ({ ...prev, [attachmentId]: true }))
		await openDocumentSecurely(filename, "files")
		setLoadingAttachments((prev) => ({ ...prev, [attachmentId]: false }))
	}

	const { data: comments, isLoading: commentsLoading } = useInspectionComments({
		workEntryId: entry?.id || "",
		enabled: entry?.entryType === "OTC_INSPECTION" && !!entry?.id,
	})

	const form = useForm<InspectionCommentSchema>({
		resolver: zodResolver(inspectionCommentSchema),
		defaultValues: {
			content: "",
			workEntryId: entry.id,
			type: !isOtcMember ? "SUPERVISOR_RESPONSE" : undefined,
		},
	})

	const canAddComment = () => {
		if (!entry || entry.inspectionStatus === "RESOLVED" || !userId) return false

		if (!isOtcMember) {
			const hasPendingResponse = comments?.some(
				(c) =>
					c.type === "SUPERVISOR_RESPONSE" &&
					!comments.some(
						(approval) =>
							approval.createdAt > c.createdAt &&
							(approval.type === "RESPONSIBLE_APPROVAL" ||
								approval.type === "RESPONSIBLE_REJECTION")
					)
			)
			return !hasPendingResponse
		}

		if (isOtcMember) {
			const hasPendingResponse = comments?.some(
				(c) =>
					c.type === "SUPERVISOR_RESPONSE" &&
					!comments.some(
						(approval) =>
							approval.createdAt > c.createdAt &&
							(approval.type === "RESPONSIBLE_APPROVAL" ||
								approval.type === "RESPONSIBLE_REJECTION")
					)
			)
			return hasPendingResponse
		}

		return false
	}

	const getAvailableCommentTypes = (): INSPECTION_COMMENT_TYPE[] => {
		if (!userId) return []
		if (!isOtcMember) {
			return ["SUPERVISOR_RESPONSE"]
		}
		if (isOtcMember) {
			return ["RESPONSIBLE_APPROVAL", "RESPONSIBLE_REJECTION"]
		}
		return []
	}

	const onSubmit = async (values: InspectionCommentSchema) => {
		if (!commentType || !entry || !userId) return

		setIsSubmitting(true)

		try {
			const files = form.getValues("files")
			let attachment

			if (files && files.length > 0) {
				attachment = await uploadFilesToCloud({
					files,
					containerType: "files",
					secondaryName: "InspectionComment-",
					randomString: entry.id.slice(0, 4),
				})
			}

			const result = await createInspectionComment({
				userId,
				workEntryId: entry.id,
				content: values.content,
				type: commentType,
				attachment,
			})

			if (result.ok) {
				toast.success(result.message)
				form.reset()
				setCommentType(!isOtcMember ? "SUPERVISOR_RESPONSE" : null)

				queryClient.invalidateQueries({
					queryKey: ["inspection-comments", { workEntryId: entry.id }],
				})
				queryClient.invalidateQueries({
					queryKey: ["work-entries"],
				})
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al enviar el comentario")
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!entry && !isLoading) return null

	return (
		<Sheet open={entry !== null || isLoading} onOpenChange={(open) => !open && onClose()}>
			<SheetContent dir="right" className="pb-10 sm:w-fit sm:max-w-lg">
				<SheetHeader className="border-border/50 border-b px-4 py-3">
					<div className="flex items-center justify-between">
						<SheetTitle>{isLoading ? "Cargando..." : "Detalles del Registro"}</SheetTitle>
					</div>
				</SheetHeader>

				<ScrollArea className="px-4">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-8 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-20 w-full" />
						</div>
					) : entry ? (
						<div className="space-y-5">
							<div>
								<h3 className="text-2xl font-semibold">{entry.activityName}</h3>
								<p className="text-muted-foreground text-sm">
									Creado por {entry.createdBy.name} el{" "}
									{format(new Date(entry.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
								</p>
							</div>

							{entry.entryType === "OTC_INSPECTION" && (
								<div className="flex items-center justify-between">
									<Badge
										className={cn(
											"text-sm",
											entry.inspectionStatus === "RESOLVED"
												? "border-green-500 bg-green-500/20 text-green-500"
												: "border-orange-500 bg-orange-500/20 text-orange-500"
										)}
										variant="outline"
									>
										{entry.inspectionStatus === "RESOLVED" ? "Resuelta" : "Reportada"}
									</Badge>
								</div>
							)}

							<div className="space-y-2">
								<h4 className="font-semibold">Detalles de la Actividad</h4>
								<div className="grid grid-cols-2 gap-2">
									<div>
										<p className="text-muted-foreground text-sm">Fecha de ejecución</p>
										<p>{format(entry.executionDate, "dd MMM yyyy", { locale: es })}</p>
									</div>
									<div>
										<p className="text-muted-foreground text-sm">Hora de inicio</p>
										<p>{entry.activityStartTime}</p>
									</div>
									<div>
										<p className="text-muted-foreground text-sm">Hora de fin</p>
										<p>{entry.activityEndTime}</p>
									</div>
								</div>
							</div>

							{entry.comments && (
								<div className="space-y-2">
									<h4 className="font-semibold">Descripción</h4>
									<p className="text-sm">{entry.comments}</p>
								</div>
							)}

							{entry.supervisionComments && (
								<div className="space-y-2">
									<h4 className="font-semibold">Comentarios de Supervisión</h4>
									<p className="text-sm">{entry.supervisionComments}</p>
								</div>
							)}

							{entry.safetyObservations && (
								<div className="space-y-2">
									<h4 className="font-semibold">Observaciones de Seguridad</h4>
									<p className="text-sm">{entry.safetyObservations}</p>
								</div>
							)}

							{entry.nonConformities && (
								<div className="space-y-2">
									<h4 className="font-semibold">No Conformidades</h4>
									<p className="text-sm">{entry.nonConformities}</p>
								</div>
							)}

							{entry.recommendations && (
								<div className="space-y-2">
									<h4 className="font-semibold">Recomendaciones</h4>
									<p className="text-sm">{entry.recommendations}</p>
								</div>
							)}

							{entry.assignedUsers.length > 0 && (
								<div className="space-y-2">
									<h4 className="font-semibold">Participantes</h4>
									<div className="flex flex-wrap gap-2">
										{entry.assignedUsers.map((user) => (
											<span
												key={user.id}
												className="rounded-lg bg-amber-600/10 px-3 py-1 text-sm text-amber-600"
											>
												{user.name} - {user.rut}
											</span>
										))}
									</div>
								</div>
							)}

							{entry.attachments.length > 0 && (
								<div className="space-y-2">
									<h4 className="font-semibold">Archivos Adjuntos</h4>
									{entry.attachments.map((attachment) => (
										<Button
											key={attachment.name}
											variant="ghost"
											onClick={() => handleViewAttachment(attachment.url, attachment.name)}
											disabled={loadingAttachments[attachment.name]}
											className="flex h-auto w-fit flex-nowrap items-center gap-1 p-0 text-sm text-orange-500 hover:underline"
										>
											{loadingAttachments[attachment.name] ? (
												<>
													{attachment.name}
													<Spinner />
												</>
											) : (
												<>
													{attachment.name}
													<ExternalLink className="h-4 w-4" />
												</>
											)}
										</Button>
									))}
								</div>
							)}

							{entry && entry.entryType === "OTC_INSPECTION" && (
								<div className="space-y-3">
									<Separator />

									<div className="space-y-4">
										<div className="flex items-center gap-2">
											<MessageSquareTextIcon className="h-5 w-5 text-amber-500" />
											<h4 className="text-lg font-semibold">Comentarios de Inspección</h4>
											{comments && comments.length > 0 && (
												<Badge variant="secondary" className="ml-1">
													{comments.length}
												</Badge>
											)}
										</div>

										{commentsLoading ? (
											<div className="space-y-4">
												{[...Array(2)].map((_, i) => (
													<div key={i} className="flex w-full max-w-96 gap-3">
														<Skeleton className="h-10 w-10 rounded-full" />
														<div className="flex-1 space-y-2">
															<Skeleton className="h-4 w-32" />
															<Skeleton className="h-16 w-full" />
														</div>
													</div>
												))}
											</div>
										) : comments && comments.length > 0 ? (
											<div className="max-h-96 space-y-4 overflow-y-auto">
												{comments.map((comment) => {
													const { props } = getImageProps({
														width: 40,
														height: 40,
														alt: comment.author.name || "",
														src: comment.author.image || "",
													})

													return (
														<div
															key={comment.id}
															className="bg-muted/30 flex w-full max-w-96 gap-3 rounded-lg p-3"
														>
															<Avatar className="h-10 w-10">
																<AvatarImage {...props} />
																<AvatarFallback>
																	<User className="h-4 w-4" />
																</AvatarFallback>
															</Avatar>

															<div className="flex w-full flex-1 flex-col gap-2">
																<div className="flex flex-col gap-2">
																	<span className="font-semibold">{comment.author.name}</span>
																	<Badge
																		variant="outline"
																		className={cn("text-xs", commentTypeColors[comment.type])}
																	>
																		{commentTypeLabels[comment.type]}
																	</Badge>
																</div>

																<div className="bg-background rounded-lg p-3">
																	<p className="text-sm">{comment.content}</p>

																	{comment.attachments.length > 0 && (
																		<div className="mt-3 space-y-1">
																			<p className="text-muted-foreground text-xs font-medium">
																				Archivos adjuntos:
																			</p>
																			{comment.attachments.map((attachment) => (
																				<Button
																					key={attachment.id}
																					variant="ghost"
																					onClick={() =>
																						handleViewAttachment(attachment.url, attachment.id)
																					}
																					disabled={loadingAttachments[attachment.id]}
																					className="flex h-auto w-fit items-center gap-1 p-0 text-xs text-orange-600 hover:underline"
																				>
																					{loadingAttachments[attachment.id] ? (
																						<>
																							{attachment.name}
																							<Spinner />
																						</>
																					) : (
																						<>
																							<FileText className="h-3 w-3" />
																							{attachment.name}
																							<ExternalLink className="h-3 w-3" />
																						</>
																					)}
																				</Button>
																			))}
																		</div>
																	)}
																</div>

																<span className="text-muted-foreground ml-auto text-sm">
																	{format(new Date(comment.createdAt), "dd MMM yyyy HH:mm", {
																		locale: es,
																	})}
																</span>
															</div>
														</div>
													)
												})}
											</div>
										) : (
											<div className="text-muted-foreground py-8 text-center">
												<MessageSquareTextIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
												<p>No hay comentarios aún</p>
											</div>
										)}

										{canAddComment() && (
											<>
												<Separator />

												<div className="space-y-4">
													{!commentType ? (
														<div className="space-y-2">
															<p className="text-sm font-medium">
																Selecciona el tipo de comentario:
															</p>
															<div className="flex gap-1">
																{userId &&
																	isOtcMember &&
																	getAvailableCommentTypes().map((type) => (
																		<Button
																			key={type}
																			variant="outline"
																			onClick={() => {
																				setCommentType(type)
																				form.setValue("type", type)
																			}}
																			className={cn(
																				"flex-1 font-medium transition-colors",
																				type === "RESPONSIBLE_APPROVAL" &&
																					"bg-green-500 text-white hover:bg-green-600",
																				type === "RESPONSIBLE_REJECTION" &&
																					"bg-red-500 text-white hover:bg-red-600",
																				type === "SUPERVISOR_RESPONSE" &&
																					"bg-blue-500 text-white hover:bg-blue-600"
																			)}
																		>
																			{commentTypeLabels[type]}
																		</Button>
																	))}
															</div>
														</div>
													) : (
														<Form {...form}>
															<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
																<div className="flex items-center justify-between">
																	{userId && isOtcMember && (
																		<>
																			<Badge
																				className={cn("text-sm", commentTypeColors[commentType])}
																			>
																				{commentTypeLabels[commentType]}
																			</Badge>
																			<Button
																				type="button"
																				variant="ghost"
																				size="sm"
																				onClick={() => {
																					setCommentType(null)
																				}}
																			>
																				Cambiar tipo
																			</Button>
																		</>
																	)}
																</div>

																<TextAreaFormField<InspectionCommentSchema>
																	name="content"
																	control={form.control}
																	label="Comentario"
																	placeholder="Escribe tu comentario aquí..."
																	className="max-w-96"
																/>

																<FileTable<InspectionCommentSchema>
																	name="files"
																	isMultiple={true}
																	maxFileSize={500}
																	control={form.control}
																	className="w-full"
																/>

																<div className="flex justify-end gap-2">
																	<Button
																		type="button"
																		variant="outline"
																		className="flex-1"
																		onClick={() => {
																			form.reset()
																			setCommentType(!isOtcMember ? "SUPERVISOR_RESPONSE" : null)
																		}}
																		disabled={isSubmitting}
																	>
																		Cancelar
																	</Button>

																	<SubmitButton
																		label="Enviar comentario"
																		isSubmitting={isSubmitting}
																		className={cn(
																			"flex-1",
																			commentType === "RESPONSIBLE_APPROVAL" &&
																				"bg-green-600 hover:bg-green-700",
																			commentType === "RESPONSIBLE_REJECTION" &&
																				"bg-red-600 hover:bg-red-700",
																			commentType === "SUPERVISOR_RESPONSE" &&
																				"bg-blue-600 hover:bg-blue-700"
																		)}
																	/>
																</div>
															</form>
														</Form>
													)}
												</div>
											</>
										)}
									</div>
								</div>
							)}
						</div>
					) : null}
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}
