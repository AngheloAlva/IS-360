"use client"

import { InfoIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const DISMISS_KEY = "demo-banner-dismissed"
const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE !== "false"

export function DemoBanner() {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		if (!DEMO_MODE_ENABLED) return
		if (typeof window === "undefined") return
		if (window.sessionStorage.getItem(DISMISS_KEY) === "1") return
		setVisible(true)
	}, [])

	if (!visible) return null

	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(
				"pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4",
			)}
		>
			<div
				className={cn(
					"pointer-events-auto flex w-full max-w-3xl items-start gap-3 rounded-2xl border border-sky-500/30 bg-sky-50/95 px-4 py-3 text-sm text-sky-900 shadow-lg backdrop-blur",
					"dark:border-sky-400/30 dark:bg-sky-950/90 dark:text-sky-100",
				)}
			>
				<InfoIcon className="mt-0.5 size-5 shrink-0 text-sky-600 dark:text-sky-300" />
				<div className="flex-1 leading-snug">
					<p className="font-medium">Estás en una demo de IS 360</p>
					<p className="text-sky-800/80 dark:text-sky-200/80">
						Todos los datos viven en tu navegador (PGlite + IndexedDB) y no se
						envían a ningún servidor. Podés crear, editar y borrar libremente.
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						window.sessionStorage.setItem(DISMISS_KEY, "1")
						setVisible(false)
					}}
					className={cn(
						"-mr-1 -mt-1 rounded-full p-1.5 text-sky-600 transition-colors hover:bg-sky-500/15 hover:text-sky-800",
						"dark:text-sky-300 dark:hover:bg-sky-400/15 dark:hover:text-sky-100",
					)}
					aria-label="Cerrar aviso de demo"
				>
					<XIcon className="size-4" />
				</button>
			</div>
		</div>
	)
}
