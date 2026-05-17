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
		return <DemoBootSplash />
	}

	return <>{children}</>
}

function DemoBootSplash() {
	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
			{/* Glow ambiente */}
			<div
				className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-500/10"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute left-1/2 top-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl"
				aria-hidden
			/>

			<div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 px-6 text-center">
				{/* Logo / brand */}
				<div className="flex items-center gap-3">
					<div className="relative size-12">
						<div className="absolute inset-0 animate-ping rounded-2xl bg-sky-500/30" />
						<div className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-lg font-bold text-white shadow-lg">
							360
						</div>
					</div>
					<div className="text-left">
						<div className="text-xl font-semibold tracking-tight">
							IS 360
						</div>
						<div className="text-xs text-muted-foreground">
							Refinería Cabo Negro · Demo
						</div>
					</div>
				</div>

				{/* Progress + mensaje */}
				<div className="flex w-full flex-col gap-3">
					<div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
						<div className="absolute inset-y-0 h-full w-1/3 animate-[demoBoot_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" />
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-foreground">
							Preparando tu demo…
						</p>
						<p className="text-xs text-muted-foreground">
							Estamos arrancando una base de datos Postgres dentro de tu
							navegador (PGlite + WASM). La primera carga puede demorar unos
							segundos; las siguientes son instantáneas.
						</p>
					</div>
				</div>
			</div>

			<style>{`
				@keyframes demoBoot {
					0%   { transform: translateX(-100%); }
					50%  { transform: translateX(150%); }
					100% { transform: translateX(350%); }
				}
			`}</style>
		</div>
	)
}
