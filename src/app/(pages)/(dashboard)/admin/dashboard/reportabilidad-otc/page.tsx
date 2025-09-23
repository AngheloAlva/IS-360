"use client"

import { useEffect, useState } from "react"

export default function PowerBIDashboardPage() {
	const [loadingStatus, setLoadingStatus] = useState<boolean>(true)
	const [iframeHeight, setIframeHeight] = useState("800px")

	useEffect(() => {
		const updateHeight = () => {
			setIframeHeight(`${Math.floor(window.innerHeight * 0.8)}px`)
		}

		updateHeight()
		window.addEventListener("resize", updateHeight)

		return () => window.removeEventListener("resize", updateHeight)
	}, [])

	const handleIframeLoad = () => {
		setLoadingStatus(false)
	}

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

			<div className="overflow-hidden rounded-lg shadow-lg">
				{loadingStatus && (
					<div className="flex items-center justify-center" style={{ height: iframeHeight }}>
						<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
					</div>
				)}

				<div className={loadingStatus ? "hidden" : "block"}>
					<iframe
						width="100%"
						frameBorder="0"
						height={iframeHeight}
						allowFullScreen={true}
						title="Reportabilidad OTC"
						onLoad={() => handleIframeLoad()}
						src={
							"https://app.powerbi.com/view?r=eyJrIjoiNDQwODQzMDItMDI0OC00MWY4LWE1NTEtOGQyNjVlMWZhNDk0IiwidCI6IjEwM2FjNTc1LTRhYmQtNDVjYi1iOGI4LWJjMjViY2IwNThiNSJ9"
						}
					/>
				</div>
			</div>
		</div>
	)
}
