"use client"

import { RotateCcwIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { revertNotAppliedDocument } from "../../actions/revert-not-applied-document"

import { Button } from "@/shared/components/ui/button"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"

import type { DocumentCategory } from "@/generated/prisma/enums"

interface RevertNotAppliedDocumentDialogProps {
	documentId: string
	documentName: string
	category: DocumentCategory
	onSuccess: () => Promise<void> | void
}

export function RevertNotAppliedDocumentDialog({
	documentId,
	documentName,
	category,
	onSuccess,
}: RevertNotAppliedDocumentDialogProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	const handleRevert = async () => {
		setIsLoading(true)
		const result = await revertNotAppliedDocument({ documentId, category })
		setIsLoading(false)

		if (!result.ok) {
			toast.error(result.message)
			return
		}

		await onSuccess()
		setIsOpen(false)
		toast.success(result.message)
	}

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button size="icon" variant="ghost" className="text-amber-600" title="Revertir No Aplica">
					<RotateCcwIcon className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Revertir No Aplica</AlertDialogTitle>
					<AlertDialogDescription>
						Se eliminara el estado "No Aplica" del documento <strong>{documentName}</strong> y
						quedara disponible para volver a cargarlo.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
					<AlertDialogAction onClick={handleRevert} disabled={isLoading}>
						{isLoading ? "Revirtiendo..." : "Revertir"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
