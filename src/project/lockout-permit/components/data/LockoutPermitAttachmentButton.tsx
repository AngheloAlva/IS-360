"use client"

import { useState } from "react"
import { EyeIcon } from "lucide-react"
import { toast } from "sonner"

import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"

interface LockoutPermitAttachmentButtonProps {
	url: string
}

export default function LockoutPermitAttachmentButton({ url }: LockoutPermitAttachmentButtonProps) {
	const [isLoading, setIsLoading] = useState(false)

	const handleViewAttachment = async () => {
		const filename = extractFilenameFromUrl(url)
		if (!filename) {
			toast.error("No se pudo determinar el nombre del archivo")
			return
		}

		setIsLoading(true)
		await openDocumentSecurely(filename, "documents")
		setIsLoading(false)
	}

	return (
		<Button variant="outline" size="sm" onClick={handleViewAttachment} disabled={isLoading}>
			{isLoading ? <Spinner /> : <EyeIcon className="h-4 w-4 min-w-4" />}
		</Button>
	)
}
