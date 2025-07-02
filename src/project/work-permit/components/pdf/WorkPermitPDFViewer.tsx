"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { PDFViewer } from "@react-pdf/renderer"
import WorkPermitPDF from "./WorkPermitPDF"
import type { WorkPermitData } from "@/app/api/work-permit/pdf/[id]/types"
import { Button } from "@/shared/components/ui/button"

interface WorkPermitPDFViewerProps {
	workPermitId: string
}

export default function WorkPermitPDFViewer({ workPermitId }: WorkPermitPDFViewerProps) {
	const [workPermitData, setWorkPermitData] = useState<WorkPermitData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchWorkPermitData = async () => {
			try {
				setLoading(true)
				const response = await fetch(`/api/work-permit/pdf/${workPermitId}`)

				if (!response.ok) {
					throw new Error(`Error al obtener datos: ${response.statusText}`)
				}

				const data = await response.json()
				setWorkPermitData(data)
				setError(null)
			} catch (err) {
				console.error("Error obteniendo datos del permiso:", err)
				setError("No se pudo cargar el permiso de trabajo. Intente nuevamente.")
			} finally {
				setLoading(false)
			}
		}

		fetchWorkPermitData()
	}, [workPermitId])

	if (loading) {
		return (
			<div className="flex h-64 w-full items-center justify-center">
				<Loader2 className="text-primary h-8 w-8 animate-spin" />
				<p className="ml-2 text-lg">Cargando documento...</p>
			</div>
		)
	}

	if (error || !workPermitData) {
		return (
			<div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4">
				<p>{error || "No se pudo cargar el documento"}</p>
				<Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
					Reintentar
				</Button>
			</div>
		)
	}

	return (
		<div className="h-[1000px] w-full overflow-hidden rounded-lg">
			<PDFViewer style={{ width: "100%", height: "100%" }}>
				<WorkPermitPDF workPermit={workPermitData} />
			</PDFViewer>
		</div>
	)
}
