"use client"

import { Loader2, CheckCircle2, ClipboardCheckIcon, ThumbsDown, ThumbsUp } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { StartupFolderWithDocuments } from "@/hooks/startup-folders/use-startup-folder"
import { addDocumentReview } from "@/actions/startup-folders/add-document-review"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
	Dialog,
	DialogClose,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/components/ui/dialog"

interface DocumentReviewFormProps {
	document:
		| StartupFolderWithDocuments["safetyAndHealthFolders"][number]["documents"][number]
		| StartupFolderWithDocuments["environmentalFolders"][number]["documents"][number]
		| StartupFolderWithDocuments["vehiclesFolders"][number]["documents"][number]
		| StartupFolderWithDocuments["workersFolders"][number]["documents"][number]
	userId: string
}

export function DocumentReviewForm({ document, userId }: DocumentReviewFormProps) {
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
				<Button disabled={isSubmitting} className="hover:bg-primary/80 size-8">
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
									<ThumbsUp className="mr-1 h-4 w-4 text-green-500" />
								</Label>
							</div>

							<div className="flex items-center space-x-2">
								<RadioGroupItem value="REJECTED" id="rejected" />
								<Label htmlFor="rejected" className="flex cursor-pointer items-center">
									Rechazar documento
									<ThumbsDown className="mr-1 h-4 w-4 text-red-500" />
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

					<DialogFooter className="flex justify-end pt-4">
						<DialogClose>
							<Button variant={"secondary"}>Cancelar</Button>
						</DialogClose>
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
									Aprobar documento
								</>
							) : approvalStatus === "REJECTED" ? (
								<>
									<ThumbsDown className="mr-2 h-4 w-4" />
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
