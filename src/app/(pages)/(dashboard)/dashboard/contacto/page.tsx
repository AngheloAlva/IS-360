"use client"

import { Construction } from "lucide-react"

export default function ContactPage() {
	return (
		<div className="flex min-h-[85vh] flex-col items-center justify-center gap-4 p-4">
			<Construction className="text-primary h-24 w-24 animate-pulse" />
			<h1 className="text-primary text-2xl font-bold">Módulo en Construcción</h1>
			<p className="text-muted-foreground max-w-lg text-center">
				Este módulo está actualmente en desarrollo. Pronto estará disponible con nuevas
				funcionalidades.
			</p>

			<p className="text-muted-foreground text-center">
				Atentamente,
				<br />
				<span className="text-primary font-semibold underline decoration-wavy">
					Ingenieria Simple
				</span>
			</p>
		</div>
	)
}
