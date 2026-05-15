"use client"

import { Button } from "@/shared/components/ui/button"
import { FileDownIcon } from "lucide-react"

export default function PdfBlankButton(): React.ReactElement {
	const handleDownloadBlankPDF = () => {
		window.open("/api/work-permit/pdf/blank", "_blank")
	}

	return (
		<Button
			size={"lg"}
			onClick={handleDownloadBlankPDF}
			className="w-10 cursor-pointer gap-1.5 bg-white font-semibold tracking-wide text-red-600 transition-all hover:scale-105 hover:bg-white hover:text-red-700 md:w-fit"
		>
			<FileDownIcon className="size-4" />
			<span className="hidden md:inline">PDF Vacío</span>
		</Button>
	)
}
