import { FrownIcon } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
	return (
		<div className="flex h-full w-full flex-1 flex-col items-center justify-between">
			<div></div>

			<div className="h-fit max-w-md text-center">
				<h1 className="text-text/60 mb-6 text-5xl font-bold">ERROR</h1>

				<div className="mb-6 flex items-center justify-center">
					<div className="text-8xl font-bold text-blue-500">4</div>
					<div className="mx-2 flex h-20 w-20 items-center justify-center rounded-xl bg-blue-500 p-4">
						<div className="bg-secondary-background rounded-lg p-1.5">
							<FrownIcon className="size-11 text-blue-500" />
						</div>
					</div>
					<div className="text-8xl font-bold text-blue-500">4</div>
				</div>

				<p className="text-muted-foreground mb-8">No encontramos la página que buscabas!</p>

				<Link
					href="/admin/dashboard/inicio"
					className="inline-block rounded-md bg-blue-500 px-6 py-2 text-sm font-medium tracking-wide transition-all hover:scale-105 hover:bg-blue-600"
				>
					Volver al inicio
				</Link>
			</div>

			<div className="text-muted-foreground py-4 text-center text-xs">
				© {new Date().getFullYear()} - OTC 360
			</div>
		</div>
	)
}
