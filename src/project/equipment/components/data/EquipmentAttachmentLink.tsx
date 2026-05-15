"use client"

import { useState } from "react"
import { toast } from "sonner"

import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"

interface EquipmentAttachmentLinkProps {
	url: string
	name: string
}

export default function EquipmentAttachmentLink({ url, name }: EquipmentAttachmentLinkProps) {
	const [isLoading, setIsLoading] = useState(false)

	const handleViewAttachment = async () => {
		const filename = extractFilenameFromUrl(url)
		if (!filename) {
			toast.error("No se pudo determinar el nombre del archivo")
			return
		}

		setIsLoading(true)
		await openDocumentSecurely(filename, "equipment")
		setIsLoading(false)
	}

	return (
		<Button
			variant="ghost"
			onClick={handleViewAttachment}
			disabled={isLoading}
			className="h-auto w-fit p-0 text-green-500 hover:underline"
		>
			{isLoading ? <Spinner /> : name}
		</Button>
	)
}
