"use client"

import { EyeIcon } from "lucide-react"
import { useState } from "react"

import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"

import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"

interface DocumentViewButtonProps {
	url: string
}

export default function DocumentViewButton({ url }: DocumentViewButtonProps) {
	const [isLoading, setIsLoading] = useState(false)

	const handleViewDocument = async () => {
		const filename = extractFilenameFromUrl(url)
		if (!filename) {
			alert("Error: No se pudo obtener el nombre del archivo")
			return
		}

		setIsLoading(true)
		await openDocumentSecurely(filename, "startup")
		setIsLoading(false)
	}

	return (
		<Button
			size="icon"
			variant="ghost"
			className="text-teal-600"
			onClick={handleViewDocument}
			disabled={isLoading}
		>
			{isLoading ? <Spinner /> : <EyeIcon className="h-4 w-4" />}
		</Button>
	)
}
