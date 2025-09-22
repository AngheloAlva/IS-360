"use client"

import { useState } from "react"
import { PaperclipIcon } from "lucide-react"
import { toast } from "sonner"

import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"

interface WorkPermitAttachmentLinkProps {
	url: string
	name: string
	attachmentId: string
}

export default function WorkPermitAttachmentLink({ url, name }: WorkPermitAttachmentLinkProps) {
	const [isLoading, setIsLoading] = useState(false)

	const handleViewAttachment = async () => {
		const filename = extractFilenameFromUrl(url)
		if (!filename) {
			toast.error("No se pudo determinar el nombre del archivo")
			return
		}

		setIsLoading(true)
		await openDocumentSecurely(filename, "files")
		setIsLoading(false)
	}

	return (
		<Button
			variant="ghost"
			onClick={handleViewAttachment}
			disabled={isLoading}
			className="flex h-auto w-fit items-center gap-1.5 p-0 font-medium text-rose-500 hover:text-rose-600 hover:underline"
		>
			{isLoading ? (
				<Spinner />
			) : (
				<>
					<PaperclipIcon className="h-4 w-4" />
					{name}
				</>
			)}
		</Button>
	)
}
