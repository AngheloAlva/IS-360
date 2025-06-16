"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
	XIcon,
	Loader2,
	FileXIcon,
	CheckCircle2,
	FileCheckIcon,
	ClipboardCheckIcon,
} from "lucide-react"

import { addDocumentReview } from "@/project/startup-folder/actions/add-document-review"
import { queryClient } from "@/lib/queryClient"

import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import {
	Dialog,
	DialogClose,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

import type {
	WorkerDocument,
	VehicleDocument,
	EnvironmentalDocument,
	SafetyAndHealthDocument,
} from "@prisma/client"

interface DocumentReviewFormProps {
	userId: string
	workerId?: string
	vehicleId?: string
	refetch: () => void
	startupFolderId: string
	document: SafetyAndHealthDocument | EnvironmentalDocument | WorkerDocument | VehicleDocument
}

export function DocumentReviewForm({
	userId,
	refetch,
	document,
	workerId,
	vehicleId,
	startupFolderId,
}: DocumentReviewFormProps) {
	const [approvalStatus, setApprovalStatus] = useState<"APPROVED" | "REJECTED" | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [comments, setComments] = useState("")
	const [isOpen, setIsOpen] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!approvalStatus) {
			toast.error("Por favor selecciona si apruebas o rechazas la carpeta")
			return
		}

		if (approvalStatus === "REJECTED" && !comments) {
			toast.error("Por favor proporciona comentarios sobre por qué rechazas la carpeta")
			return
		}

		setIsSubmitting(true)

		try {
			const response = await addDocumentReview({
				comments,
				reviewerId: userId,
				status: approvalStatus,
				documentId: document.id,
				category: document.category,
			})

			if (!response.ok) {
				throw new Error("Error al procesar la revisión del documento")
			}

			toast(approvalStatus === "APPROVED" ? "Documento aprobado" : "Documento rechazado", {
				description:
					approvalStatus === "APPROVED"
						? "El documento ha sido aprobado correctamente"
						: "El documento ha sido rechazado correctamente",
			})

			queryClient.invalidateQueries({
				queryKey: ["startupFolderDocuments", { startupFolderId, workerId, vehicleId }],
			})

			refetch()
			setIsOpen(false)
		} catch (error) {
			console.error(error)
			toast.error("Ocurrió un error al procesar la revisión")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					disabled={isSubmitting}
					className="size-8 bg-emerald-600 transition-all hover:scale-105 hover:bg-emerald-700 hover:text-white"
				>
					<ClipboardCheckIcon />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Revisar documento</DialogTitle>
					<DialogDescription>
						Revisa el documento y aprueba o rechaza según corresponda
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={onSubmit} className="space-y-4">
					<div className="space-y-2 py-4">
						<RadioGroup
							id="approval-status"
							value={approvalStatus || ""}
							onValueChange={(value) => setApprovalStatus(value as "APPROVED" | "REJECTED")}
							className="flex flex-col gap-4"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="APPROVED" id="approved" />
								<Label htmlFor="approved" className="flex cursor-pointer items-center">
									Aprobar documento
									<FileCheckIcon className="mr-1 h-4 w-4 text-emerald-500" />
								</Label>
							</div>

							<div className="flex items-center space-x-2">
								<RadioGroupItem value="REJECTED" id="rejected" />
								<Label htmlFor="rejected" className="flex cursor-pointer items-center">
									Rechazar documento
									<FileXIcon className="mr-1 h-4 w-4 text-rose-500" />
								</Label>
							</div>
						</RadioGroup>
					</div>

					<div className="space-y-2">
						<Label htmlFor="review-comments">
							Comentarios{" "}
							{approvalStatus === "REJECTED" && <span className="text-rose-500">*</span>}
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

					<DialogFooter className="flex justify-end pt-4">
						<DialogClose>
							<Button type="button" variant={"secondary"}>
								Cancelar
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={isSubmitting || (approvalStatus === "REJECTED" && !comments)}
							className={
								approvalStatus === "APPROVED"
									? "bg-emerald-600 hover:bg-emerald-700"
									: approvalStatus === "REJECTED"
										? "bg-rose-600 hover:bg-rose-700"
										: ""
							}
						>
							{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{approvalStatus === "APPROVED" ? (
								<>
									<CheckCircle2 className="mr-2 h-4 w-4" />
									Aprobar documento
								</>
							) : approvalStatus === "REJECTED" ? (
								<>
									<XIcon className="mr-2 h-4 w-4" />
									Rechazar documento
								</>
							) : (
								"Procesar revisión"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
