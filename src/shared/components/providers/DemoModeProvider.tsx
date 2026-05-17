"use client"

import { useEffect, useState } from "react"

const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE !== "false"

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
	const [ready, setReady] = useState(!DEMO_MODE_ENABLED)
	const [error, setError] = useState<Error | null>(null)

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
				if (!cancelled) {
					setError(err instanceof Error ? err : new Error(String(err)))
				}
			}
		}
		void start()

		return () => {
			cancelled = true
		}
	}, [])

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="max-w-2xl space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-6">
					<h1 className="text-lg font-semibold text-destructive">
						La demo no pudo arrancar
					</h1>
					<p className="text-sm text-muted-foreground">
						El bootstrap de la base de datos local (PGlite + MSW) falló. La app
						no puede continuar sin el modo demo porque caería a Prisma sin
						configurar y todas las rutas devolverían 500.
					</p>
					<details className="text-xs">
						<summary className="cursor-pointer text-muted-foreground">
							Ver error técnico
						</summary>
						<pre className="mt-2 overflow-auto rounded bg-background p-3 text-foreground">
							{error.message}
							{error.stack ? `\n\n${error.stack}` : ""}
						</pre>
					</details>
					<p className="text-xs text-muted-foreground">
						Probá limpiar IndexedDB (DevTools → Application → Storage → Clear
						site data) y recargar.
					</p>
				</div>
			</div>
		)
	}

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
