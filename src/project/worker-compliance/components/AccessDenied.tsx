import { ShieldOffIcon } from "lucide-react"

export function AccessDenied() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
			<ShieldOffIcon className="size-12 text-muted-foreground" />
			<div className="flex flex-col gap-1">
				<h2 className="text-lg font-semibold">Acceso denegado</h2>
				<p className="text-sm text-muted-foreground">
					No tienes permisos para ver esta página.
				</p>
			</div>
		</div>
	)
}
