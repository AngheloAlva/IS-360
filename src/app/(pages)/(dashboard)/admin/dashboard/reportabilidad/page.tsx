"use client"

import { DatabaseZapIcon, HandshakeIcon, SirenIcon, StarIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

type DashboardId = "dashboard1" | "dashboard2" | "dashboard3" | "dashboard4"

type Dashboard = {
	title: string
	url: string
	icon: React.ReactNode
}

type DashboardsMap = {
	[key in DashboardId]: Dashboard
}

type LoadingStatusMap = {
	[key in DashboardId]: boolean
}

export default function PowerBIDashboardPage() {
	const [iframeHeight, setIframeHeight] = useState("800px")
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusMap>({
		dashboard1: true,
		dashboard2: true,
		dashboard3: true,
		dashboard4: true,
	})
	const [activeTab, setActiveTab] = useState<DashboardId>("dashboard1")

	// Power BI embed URLs
	const dashboards: DashboardsMap = {
		dashboard1: {
			title: "Análisis Alarmas (DAS)",
			url: "https://app.powerbi.com/view?r=eyJrIjoiYTViOWRiM2ItMmY0Yi00Y2VmLTllNWUtZDI5YjdiYWFhMzkxIiwidCI6IjEwM2FjNTc1LTRhYmQtNDVjYi1iOGI4LWJjMjViY2IwNThiNSJ9",
			icon: <SirenIcon className="h-4 w-4" />,
		},
		dashboard2: {
			title: "Seguimiento de Tareas",
			url: "https://app.powerbi.com/view?r=eyJrIjoiZjVmNDE0OGItNDg5ZC00ZmQxLTkzM2EtYmExMTJhNmY2MzI2IiwidCI6IjEwM2FjNTc1LTRhYmQtNDVjYi1iOGI4LWJjMjViY2IwNThiNSJ9",
			icon: <HandshakeIcon className="h-4 w-4" />,
		},
		dashboard3: {
			title: "Reporte Mensual Interno",
			url: "https://app.powerbi.com/view?r=eyJrIjoiMjIxYzY3ZmItYmY3MS00Y2MxLWE5YTgtYTUzZmVmMzY5MGFmIiwidCI6IjEwM2FjNTc1LTRhYmQtNDVjYi1iOGI4LWJjMjViY2IwNThiNSJ9",
			icon: <DatabaseZapIcon className="h-4 w-4" />,
		},
		dashboard4: {
			title: "Reporte Directorio",
			url: "https://app.powerbi.com/view?r=eyJrIjoiYTYyMDc0ZmUtYzZjNS00MTdhLWFkYjktMzJjYWZiNmRkZjBkIiwidCI6IjEwM2FjNTc1LTRhYmQtNDVjYi1iOGI4LWJjMjViY2IwNThiNSJ9",
			icon: <StarIcon className="h-4 w-4" />,
		},
	}

	// Handle iframe load events
	const handleIframeLoad = (dashboardId: DashboardId) => {
		setLoadingStatus((prev) => ({ ...prev, [dashboardId]: false }))
	}

	// Adjust height based on viewport
	useEffect(() => {
		const updateHeight = () => {
			// Set iframe height to be 80% of viewport height
			setIframeHeight(`${Math.floor(window.innerHeight * 0.8)}px`)
		}

		// Set initial height
		updateHeight()

		// Update height on window resize
		window.addEventListener("resize", updateHeight)

		return () => window.removeEventListener("resize", updateHeight)
	}, [])

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-4 overflow-hidden transition-all">
			<div className="rounded-lg bg-gradient-to-r from-blue-600 to-green-600 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Reportabilidad</h1>
						<p className="opacity-90">
							Panel de reportes para monitoreo de operaciones, mantenimiento y más.
						</p>
						<p className="text-sm font-semibold opacity-90">
							* Los paneles interactivos pueden tardar unos segundos en cargar completamente.
						</p>
					</div>
				</div>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(newVal) => setActiveTab(newVal as DashboardId)}
				className="w-full"
			>
				<TabsList className="h-11 w-full">
					{Object.entries(dashboards).map(([key, dashboard]) => (
						<TabsTrigger key={key} value={key} className="flex h-9 items-center gap-2">
							{dashboard.icon}
							{dashboard.title}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContents>
					{(Object.entries(dashboards) as [DashboardId, Dashboard][]).map(([key, dashboard]) => (
						<TabsContent key={key} value={key} className="mt-0">
							<div className="overflow-hidden rounded-lg shadow-lg">
								{loadingStatus[key] && (
									<div
										className="flex items-center justify-center"
										style={{ height: iframeHeight }}
									>
										<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
									</div>
								)}

								<div className={loadingStatus[key] ? "hidden" : "block"}>
									<iframe
										title={dashboard.title}
										width="100%"
										height={iframeHeight}
										src={dashboard.url}
										frameBorder="0"
										allowFullScreen={true}
										onLoad={() => handleIframeLoad(key)}
									/>
								</div>
							</div>
						</TabsContent>
					))}
				</TabsContents>
			</Tabs>
		</div>
	)
}
