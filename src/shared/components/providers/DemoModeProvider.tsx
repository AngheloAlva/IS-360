"use client"

import { useEffect, useState } from "react"

const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE !== "false"

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
	const [ready, setReady] = useState(!DEMO_MODE_ENABLED)

	useEffect(() => {
		if (!DEMO_MODE_ENABLED) return

		let cancelled = false
		const start = async () => {
			try {
				const [{ worker }, { getDemoDb }] = await Promise.all([
					import("@/lib/demo-db/msw/browser"),
					import("@/lib/demo-db/client"),
				])
				await getDemoDb()
				await worker.start({
					onUnhandledRequest: "bypass",
					serviceWorker: { url: "/mockServiceWorker.js" },
					quiet: process.env.NODE_ENV === "production",
				})
				if (!cancelled) setReady(true)
			} catch (err) {
				console.error("[demo-db] No se pudo iniciar el modo demo:", err)
				if (!cancelled) setReady(true)
			}
		}
		void start()

		return () => {
			cancelled = true
		}
	}, [])

	if (!ready) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
					<span>Cargando demo…</span>
				</div>
			</div>
		)
	}

	return <>{children}</>
}
