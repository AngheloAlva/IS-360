"use client"

import { Loader2Icon, RotateCcwIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { resetDemoDb } from "@/lib/demo-db/client"
import { cn } from "@/lib/utils"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"

const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE !== "false"

export function DemoResetFab() {
	const [open, setOpen] = useState(false)
	const [resetting, setResetting] = useState(false)

	if (!DEMO_MODE_ENABLED) return null

	const handleReset = async () => {
		setResetting(true)
		try {
			await resetDemoDb()
			window.sessionStorage.removeItem("demo-banner-dismissed")
			toast.success("Demo reiniciada — recargando…")
			setTimeout(() => window.location.reload(), 400)
		} catch (err) {
			console.error("[demo-reset]", err)
			toast.error(
				err instanceof Error ? err.message : "No se pudo reiniciar la demo",
			)
			setResetting(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<button
					type="button"
					title="Resetear demo"
					aria-label="Resetear demo"
					className={cn(
						"group fixed bottom-4 right-4 z-40 flex h-11 items-center gap-2 rounded-full border border-border bg-background/90 px-3 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-all",
						"hover:bg-background hover:shadow-xl hover:scale-[1.02]",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					)}
				>
					<RotateCcwIcon className="size-4 text-muted-foreground group-hover:text-foreground" />
					<span className="hidden sm:inline">Resetear demo</span>
				</button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Resetear la demo?</AlertDialogTitle>
					<AlertDialogDescription>
						Esto elimina toda la información local (PGlite + IndexedDB) y vuelve
						a sembrar los datos iniciales. Se perderán los cambios que hayas
						hecho durante esta sesión.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={resetting}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault()
							void handleReset()
						}}
						disabled={resetting}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{resetting ? (
							<>
								<Loader2Icon className="mr-2 size-4 animate-spin" />
								Reiniciando…
							</>
						) : (
							"Sí, resetear"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
