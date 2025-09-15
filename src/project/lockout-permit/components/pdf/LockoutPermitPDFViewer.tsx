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
			fetchLockoutPermitData()
		}
	}, [lockoutPermitId])

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2Icon className="h-8 w-8 animate-spin text-lime-600" />
					<p className="text-muted-foreground">Cargando permiso de bloqueo...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-lg font-medium text-red-500">Error al cargar el permiso</p>
					<p className="text-muted-foreground mt-2">{error}</p>
				</div>
			</div>
		)
	}

	if (!lockoutPermitData) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground text-lg">Permiso de bloqueo no encontrado</p>
				</div>
			</div>
		)
	}

	return (
		<div className="h-[85dvh] w-full overflow-hidden rounded-lg">
			<PDFViewer width="100%" height="100%" showToolbar>
				<LockoutPermitPDF lockoutPermit={lockoutPermitData} />
			</PDFViewer>
		</div>
	)
}
