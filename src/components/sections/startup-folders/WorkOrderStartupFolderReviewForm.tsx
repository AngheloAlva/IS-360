"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WorkOrderStartupFolderWithDocuments } from "@/hooks/startup-folders/use-work-order-startup-folder"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2, ThumbsDown, ThumbsUp } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { es } from "date-fns/locale"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

interface WorkOrderStartupFolderReviewFormProps {
	folder: WorkOrderStartupFolderWithDocuments
	userId: string
}

export function WorkOrderStartupFolderReviewForm({
	folder,
	userId,
}: WorkOrderStartupFolderReviewFormProps) {
	const [approvalStatus, setApprovalStatus] = useState<"APPROVED" | "REJECTED" | null>(null)
	const [comments, setComments] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const router = useRouter()
	const queryClient = useQueryClient()

	// Función para revisar la carpeta
	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!approvalStatus) {
			toast.error("Error", {
				description: "Por favor selecciona si apruebas o rechazas la carpeta",
			})
			return
		}

		if (approvalStatus === "REJECTED" && !comments) {
			toast.error("Error", {
				description: "Por favor proporciona comentarios sobre por qué rechazas la carpeta",
			})
			return
		}

		setIsSubmitting(true)

		try {
			const response = await fetch(`/api/startup-folders/work-order/review`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					folderId: folder.id,
					status: approvalStatus,
					comments: comments.trim() || null,
					reviewerId: userId,
				}),
			})

			if (!response.ok) {
				throw new Error("Error al procesar la revisión de la carpeta")
			}

			// Mostrar mensaje de éxito
			toast(approvalStatus === "APPROVED" ? "Carpeta aprobada" : "Carpeta rechazada", {
				description:
					approvalStatus === "APPROVED"
						? "La empresa contratista ha sido notificada sobre la aprobación"
						: "La empresa contratista ha sido notificada sobre el rechazo",
			})

			// Refrescar los datos
			queryClient.invalidateQueries({
				queryKey: ["workOrderStartupFolder", folder.id],
			})

			// Redireccionar a la pestaña de documentos
			router.push(`/dashboard/carpetas-de-arranque/orden/${folder.id}?tab=documentos`)
		} catch (error) {
			console.error(error)
			toast.error("Error", {
				description: "Ocurrió un error al procesar la revisión",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Revisar carpeta de arranque</CardTitle>
				<CardDescription>
					Revisa los documentos de la carpeta y aprueba o rechaza según corresponda
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit} className="space-y-4">
					<div className="bg-muted rounded-md p-4">
						<div className="flex flex-col space-y-2">
							<div className="flex items-center">
								<span className="w-28 font-medium">Empresa:</span>
								<span>{folder.workOrder.company.name}</span>
							</div>
							<div className="flex items-center">
								<span className="w-28 font-medium">Orden:</span>
								<span>
									{folder.workOrder.otNumber} - {folder.workOrder.workDescription}
								</span>
							</div>
							<div className="flex items-center">
								<span className="w-28 font-medium">Enviado el:</span>
								<span>
									{folder.submittedAt
										? format(new Date(folder.submittedAt), "PPP 'a las' p", { locale: es })
										: "No enviado aún"}
								</span>
							</div>
							<div className="flex items-center">
								<span className="w-28 font-medium">Enviado por:</span>
								<span>{folder.submittedBy?.name || "No enviado aún"}</span>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="approval-status">Decisión</Label>
						<RadioGroup
							id="approval-status"
							value={approvalStatus || ""}
							onValueChange={(value) => setApprovalStatus(value as "APPROVED" | "REJECTED")}
							className="flex gap-4"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="APPROVED" id="approved" />
								<Label htmlFor="approved" className="flex cursor-pointer items-center">
									<ThumbsUp className="mr-1 h-4 w-4 text-green-500" />
									Aprobar carpeta
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="REJECTED" id="rejected" />
								<Label htmlFor="rejected" className="flex cursor-pointer items-center">
									<ThumbsDown className="mr-1 h-4 w-4 text-red-500" />
									Rechazar carpeta
								</Label>
							</div>
						</RadioGroup>
					</div>

					<div className="space-y-2">
						<Label htmlFor="review-comments">
							Comentarios {approvalStatus === "REJECTED" && <span className="text-red-500">*</span>}
						</Label>
						<Textarea
							id="review-comments"
							placeholder={
								approvalStatus === "REJECTED"
									? "Explica por qué rechazas la carpeta y qué debe corregirse..."
									: "Comentarios opcionales sobre la aprobación..."
							}
							value={comments}
							onChange={(e) => setComments(e.target.value)}
							rows={5}
							className="resize-none"
						/>
						{approvalStatus === "REJECTED" && (
							<p className="text-muted-foreground text-xs">
								Los comentarios son obligatorios al rechazar una carpeta.
							</p>
						)}
					</div>

					<div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/30">
						<div className="flex">
							<AlertCircle className="mr-2 h-5 w-5 shrink-0 text-amber-500" />
							<div>
								<h3 className="font-medium text-amber-700 dark:text-amber-300">Importante</h3>
								<p className="text-sm text-amber-600 dark:text-amber-400">
									Una vez que apruebes o rechaces la carpeta, se enviará una notificación automática
									a la empresa contratista.
								</p>
							</div>
						</div>
					</div>

					<div className="flex justify-end pt-4">
						<Button
							type="submit"
							disabled={isSubmitting || (approvalStatus === "REJECTED" && !comments)}
							className={
								approvalStatus === "APPROVED"
									? "bg-green-600 hover:bg-green-700"
									: approvalStatus === "REJECTED"
										? "bg-red-600 hover:bg-red-700"
										: ""
							}
						>
							{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{approvalStatus === "APPROVED" ? (
								<>
									<CheckCircle2 className="mr-2 h-4 w-4" />
									Aprobar carpeta
								</>
							) : approvalStatus === "REJECTED" ? (
								<>
									<ThumbsDown className="mr-2 h-4 w-4" />
									Rechazar carpeta
								</>
							) : (
								"Procesar revisión"
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
