"use client"

import { PDFViewer } from "@react-pdf/renderer"
import { useEffect, useState } from "react"
import { Loader2Icon } from "lucide-react"

import LockoutPermitPDF from "./LockoutPermitPDF"

import type { LockoutPermitData } from "@/app/api/lockout-permit/pdf/[id]/types"

interface LockoutPermitPDFViewerProps {
	lockoutPermitId: string
}

export default function LockoutPermitPDFViewer({ lockoutPermitId }: LockoutPermitPDFViewerProps) {
	const [lockoutPermitData, setLockoutPermitData] = useState<LockoutPermitData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchLockoutPermitData = async () => {
			try {
				setLoading(true)
				const response = await fetch(`/api/lockout-permit/pdf/${lockoutPermitId}`)

				if (!response.ok) {
					throw new Error("Error al obtener los datos del permiso de bloqueo")
				}

				const data = await response.json()
				setLockoutPermitData(data)
			} catch (err) {
				console.error("Error fetching lockout permit data:", err)
				setError(err instanceof Error ? err.message : "Error desconocido")
			} finally {
				setLoading(false)
			}
		}

		if (lockoutPermitId) {
   void fetchLockoutPermitData()
		}
	}, [lockoutPermitId])

	if (loading) {
		return (
			<div className="flex h-64 w-full items-center justify-center">
				<Loader2Icon className="text-primary h-8 w-8 animate-spin" />
				<p className="ml-2 text-lg">Cargando documento...</p>
			</div>
		)
	}

	if (error || !lockoutPermitData) {
		return (
			<div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4">
				<p>{error || "No se pudo cargar el documento"}</p>
			</div>
		)
	}

	return (
		<div className="h-[1000px] w-full overflow-hidden rounded-lg">
			<PDFViewer style={{ width: "100%", height: "100%" }}>
				<LockoutPermitPDF data={lockoutPermitData} />
			</PDFViewer>
		</div>
	)
}
