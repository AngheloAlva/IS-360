"use client"

import { Download } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { generateCertificate } from "../actions/generate-certificate"
import { Button } from "@/shared/components/ui/button"

interface DownloadCertificateButtonProps {
	userSafetyTalkId: string
	userName: string
	category: string
	canDownload: boolean
}

export function DownloadCertificateButton({
	userSafetyTalkId,
	userName,
	category,
	canDownload,
}: DownloadCertificateButtonProps) {
	const [isDownloading, setIsDownloading] = useState(false)

	const handleDownload = async () => {
		if (!canDownload) {
			toast.error("El certificado no está disponible")
			return
		}

		setIsDownloading(true)
		try {
			const result = await generateCertificate(userSafetyTalkId)

			if (result.success && result.pdf) {
				const blob = base64ToBlob(result.pdf, "application/pdf")
				const url = URL.createObjectURL(blob)
				const link = document.createElement("a")
				link.href = url
				link.download = result.filename || `certificado-${category}-${userName}.pdf`
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				URL.revokeObjectURL(url)
				toast.success("Certificado descargado exitosamente")
			} else {
				toast.error(result.error || "Error al generar el certificado")
			}
		} catch (error) {
			console.error("Error downloading certificate:", error)
			toast.error("Error al descargar el certificado")
		} finally {
			setIsDownloading(false)
		}
	}

	const base64ToBlob = (base64: string, type: string) => {
		const byteCharacters = atob(base64)
		const byteNumbers = new Array(byteCharacters.length)
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i)
		}
		const byteArray = new Uint8Array(byteNumbers)
		return new Blob([byteArray], { type })
	}

	if (!canDownload) {
		return null
	}

	return (
		<Button
			size="icon"
			variant="ghost"
			onClick={handleDownload}
			disabled={isDownloading}
			title="Descargar certificado"
		>
			<Download className={`h-4 w-4 text-emerald-500 ${isDownloading ? "animate-pulse" : ""}`} />
		</Button>
	)
}
