"use client"

import { useState } from "react"

import VisitorMap from "./VisitorMap"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import { cn } from "@/lib/utils"
import { InfoIcon } from "lucide-react"

interface MapPoint {
	id: string
	name: string
	description: string
	position: { x: number; y: number }
	videoUrl: string
	variant: "default" | "evacuation" | "emergency"
}

const mapPoints: MapPoint[] = [
	{
		id: "point1",
		name: "Entrada a la planta",
		description: "Presentación de la planta IS 360",
		position: { x: 7, y: 86 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1eE7JEOpzftpB9_7nj67BLw1rNBhNFso-/preview",
	},
	{
		id: "point2",
		name: "Elementos básicos",
		description: "Elementos básicos de seguridad",
		position: { x: 8, y: 75 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1UpkebgtBkwquBA9XbTX33Yz5eEbv0QYH/preview",
	},
	{
		id: "point3",
		name: "Areas Restringidas",
		description: "Intrucciones para Areas Restringidas",
		position: { x: 10, y: 67 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1OzGaF7IZ-hvWXMBAaoHsq1lNGe1y-DXm/preview",
	},
	{
		id: "point4",
		name: "Prohibiciones",
		description: "Prohibiciones en la planta",
		position: { x: 10, y: 62 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1rurbDwzhLDw2RuKwjPPnvPofp0Rg5ORt/preview",
	},
	{
		id: "point5",
		name: "Riesgos",
		description: "Riesgos en la planta",
		position: { x: 8, y: 58 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1H1gg4vNcfoFdJONcxmQTEscAFspyUKBX/preview",
	},
	{
		id: "point6",
		name: "Punto de Encuentro N°1",
		description: "Punto de Encuentro N°1",
		position: { x: 6, y: 70 },
		variant: "evacuation",
		videoUrl: "https://drive.google.com/file/d/10HEalP7xQYwv8C2qf-KIo02jy4BlUGzN/preview",
	},
	{
		id: "point7",
		name: "Emergencia Electrica",
		description: "Emergencia Electrica",
		position: { x: 8.8, y: 44 },
		variant: "emergency",
		videoUrl: "https://drive.google.com/file/d/1HkNHDITvbXA-uswMRe2kxGye2Lcw9cDf/preview",
	},
	{
		id: "point8",
		name: "Emergencia de Incendio",
		description: "Emergencia de Incendio",
		position: { x: 20, y: 14 },
		variant: "emergency",
		videoUrl: "https://drive.google.com/file/d/1lgMeP-k18UcnOwOiega0J55zu-Moyh30/preview",
	},
	{
		id: "point9",
		name: "Emergencia Desastre Natural",
		description: "Emergencia Desastre Natural",
		position: { x: 8, y: 31 },
		variant: "emergency",
		videoUrl: "https://drive.google.com/file/d/1NW0SZ1RMZI_LcMgBsstwvrLGN5SKj5GU/preview",
	},
	{
		id: "point10",
		name: "Punto de Encuentro N°2",
		description: "Punto de Encuentro N°2",
		position: { x: 4.5, y: 33 },
		variant: "evacuation",
		videoUrl: "https://drive.google.com/file/d/1oNIQtQ1ICmFQHW8gHz-EAHutTZSpFmqM/preview",
	},
	{
		id: "point11",
		name: "Sala de Control",
		description: "Sala de Control",
		position: { x: 4.5, y: 26.5 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1E91-C9_T5kYlCoLdyk7LN-oi5gbNebQg/preview",
	},
	{
		id: "point12",
		name: "Transito Seguro",
		description: "Transito Seguro",
		position: { x: 16, y: 19 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1W6fhWgOTsfFdXDgD5kI3KJK6iEE5hQQ5/preview",
	},
	{
		id: "point13",
		name: "Riesgo de Caida",
		description: "Riesgo de Caida",
		position: { x: 55, y: 37 },
		variant: "emergency",
		videoUrl: "https://drive.google.com/file/d/1w_U2lAq1dq5Vv4uiPDeYLPSsrTTVDH-f/preview",
	},
	{
		id: "point14",
		name: "Barandas Escaleras",
		description: "Barandas Escaleras",
		position: { x: 55, y: 24 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1wr8b9O7HqYbVRrWWt_TxYwNXuTPwz1sH/preview",
	},
	{
		id: "point15",
		name: "Punto de Encuentro N°3",
		description: "Punto de Encuentro N°3",
		position: { x: 94, y: 12 },
		variant: "evacuation",
		videoUrl: "https://drive.google.com/file/d/1tMVX4eNK7ktje1G3cmekAolYOLE497WF/preview",
	},
	{
		id: "point16",
		name: "Punto de Encuentro N°4",
		description: "Punto de Encuentro N°4 y Via de evacuación",
		position: { x: 94, y: 81 },
		variant: "evacuation",
		videoUrl: "https://drive.google.com/file/d/1s-OglSax2gocFTUzTbS10JZp2mNq9FpK/preview",
	},
	{
		id: "point17",
		name: "Velocidad Maxima",
		description: "Velocidad Maxima",
		position: { x: 62, y: 83 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1gscqucNvAISWR1UM2dlLWrwGjvpPqELL/preview",
	},
	{
		id: "point18",
		name: "No botar Basura",
		description: "No botar Basura",
		position: { x: 40, y: 80 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1AJ-SaV77NSF7fOCsfZSO0M8FIb8KXrQy/preview",
	},
	{
		id: "point19",
		name: "Via de evacuación",
		description: "Via de evacuación",
		position: { x: 10, y: 82 },
		variant: "evacuation",
		videoUrl: "https://drive.google.com/file/d/1Rgl_4p6bhtkcaOP7IjJjzxc0BGPOA78C/preview",
	},
	{
		id: "point20",
		name: "Baliza Sonora",
		description: "Baliza Sonora",
		position: { x: 12, y: 34 },
		variant: "default",
		videoUrl: "https://drive.google.com/file/d/1DgEskFDncHtRlK5u5m_YcrIdWQH8H5fU/preview",
	},
	{
		id: "point21",
		name: "Via de evacuación 2",
		description: "Via de evacuación 2",
		position: { x: 7.5, y: 16 },
		variant: "evacuation",
		videoUrl: "https://drive.google.com/file/d/1shuMEy7muCB-m5ngObT7-PvcAAm5E1Qr/preview",
	},
]

export function VisitorTalkMap() {
	const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
	const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)

	return (
		<div className="relative w-full">
			<div className="relative h-fit w-full rounded-lg">
				<VisitorMap />

				{mapPoints.map((point) => (
					<div
						key={point.id}
						className={cn(
							"text-background absolute z-10 flex size-5 cursor-pointer items-center rounded-full bg-sky-500 transition-all duration-200 hover:scale-105 hover:bg-sky-600",
							{
								"bg-red-500 hover:bg-red-600": point.variant === "emergency",
								"bg-yellow-500 hover:bg-yellow-600": point.variant === "evacuation",
							}
						)}
						style={{
							left: `${point.position.x}%`,
							top: `${point.position.y}%`,
							transform: "translate(-50%, -50%)",
						}}
						onClick={() => setSelectedPoint(point)}
						onMouseEnter={() => setHoveredPoint(point.id)}
						onMouseLeave={() => setHoveredPoint(null)}
					>
						{hoveredPoint === point.id && (
							<div className="bg-text text-background absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full rounded px-2 py-1 text-xs whitespace-nowrap shadow">
								{point.name}
							</div>
						)}
						<InfoIcon className="size-5" />
					</div>
				))}
			</div>

			<Dialog open={!!selectedPoint} onOpenChange={(open) => !open && setSelectedPoint(null)}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader className="flex flex-row items-center justify-start gap-2">
						<div
							className={cn("rounded-lg bg-sky-500/10 p-2 text-sky-600", {
								"bg-red-500/10 text-red-600": selectedPoint?.variant === "emergency",
								"bg-yellow-500/10 text-yellow-600": selectedPoint?.variant === "evacuation",
							})}
						>
							<InfoIcon className="size-6" />
						</div>
						<div>
							<DialogTitle>{selectedPoint?.name}</DialogTitle>
							<DialogDescription>{selectedPoint?.description}</DialogDescription>
						</div>
					</DialogHeader>

					<div className="mt-4">
						<div className="aspect-video overflow-hidden rounded-md">
							{selectedPoint && (
								// <video
								// 	controls
								// 	className="h-full w-full"
								// 	src={selectedPoint.videoUrl}
								// 	poster="/images/video-poster.jpg"
								// >
								// 	Tu navegador no soporta la reproducción de videos.
								// </video>
								<iframe
									src={selectedPoint.videoUrl}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
									className="h-full w-full"
								/>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
