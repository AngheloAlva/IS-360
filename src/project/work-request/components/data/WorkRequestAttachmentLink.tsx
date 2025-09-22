"use client"

import { useState } from "react"
import { FileTextIcon } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"

interface WorkRequestAttachmentLinkProps {
	url: string
	name: string
}

export default function WorkRequestAttachmentLink({ url, name }: WorkRequestAttachmentLinkProps) {
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
			className="hover:bg-text/10 relative h-auto w-full overflow-hidden rounded-md border p-0 transition-colors"
		>
			{isLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
					<Spinner />
				</div>
			)}
			<div className="relative flex h-32 w-full items-center justify-center">
				{url.includes(".pdf") ? (
					<FileTextIcon className="size-12" />
				) : (
					<Image fill src={url} alt={name} className="object-cover" />
				)}
			</div>
		</Button>
	)
}
