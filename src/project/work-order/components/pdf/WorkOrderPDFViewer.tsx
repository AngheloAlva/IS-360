"use client"

import { PDFViewer } from "@react-pdf/renderer"
import { FileTextIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/components/ui/button"
import WorkOrderPDF from "./WorkOrderPDF"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
} from "@/shared/components/ui/dialog"

import type { WorkOrderPDFData } from "@/app/api/work-order/pdf/[id]/types"

interface WorkOrderPDFViewerProps {
	workOrderId: string
	workOrderNumber: string
}

export default function WorkOrderPDFViewer({
	workOrderId,
	workOrderNumber,
}: WorkOrderPDFViewerProps): React.ReactElement {
	const [isOpen, setIsOpen] = useState(false)
	const [workOrderData, setWorkOrderData] = useState<WorkOrderPDFData | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchWorkOrderData = async () => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch(`/api/work-order/pdf/${workOrderId}`)

			if (!response.ok) {
				throw new Error("Error al obtener los datos de la orden de trabajo")
			}

			const data = await response.json()
			setWorkOrderData(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error desconocido")
		} finally {
			setIsLoading(false)
		}
	}

	const handleOpenDialog = () => {
		setIsOpen(true)
		if (!workOrderData) {
			fetchWorkOrderData()
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="ml-auto border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
					onClick={handleOpenDialog}
				>
					<FileTextIcon className="mr-2 h-4 w-4" />
					Exportar PDF
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-6xl">
				<DialogHeader>
					<DialogTitle>Reporte de {workOrderNumber}</DialogTitle>
				</DialogHeader>

				<div className="h-[85vh]">
					{isLoading && (
						<div className="flex h-full items-center justify-center">
							<div className="text-center">
								<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600"></div>
								<p>Generando reporte...</p>
							</div>
						</div>
					)}

					{error && (
						<div className="flex h-full items-center justify-center">
							<div className="text-center text-red-600">
								<p>Error: {error}</p>
								<Button variant="outline" size="sm" className="mt-4" onClick={fetchWorkOrderData}>
									Reintentar
								</Button>
							</div>
						</div>
					)}

					{workOrderData && !isLoading && !error && (
						<PDFViewer width="100%" height="100%" className="rounded-lg border">
							<WorkOrderPDF workOrder={workOrderData} />
						</PDFViewer>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
