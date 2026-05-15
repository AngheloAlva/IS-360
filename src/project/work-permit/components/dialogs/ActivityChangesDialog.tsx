"use client"

import { InfoIcon } from "lucide-react"
import Image from "next/image"

import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"

const STORAGE_KEY = "work-permit-activity-changes-seen"

export function useActivityChangesDialog() {
	if (typeof window === "undefined") return { shouldShow: false, markAsSeen }

	const seen = localStorage.getItem(STORAGE_KEY)
	return { shouldShow: !seen, markAsSeen }
}

function markAsSeen() {
	localStorage.setItem(STORAGE_KEY, "true")
}

interface ActivityChangesDialogProps {
	isOpen: boolean
	onClose: () => void
}

export default function ActivityChangesDialog({ isOpen, onClose }: ActivityChangesDialogProps) {
	const handleClose = () => {
		markAsSeen()
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/20">
						<InfoIcon className="h-6 w-6 text-indigo-500" />
					</div>
					<DialogTitle className="text-center text-xl font-semibold">
						Nuevo formato de actividades
					</DialogTitle>
					<DialogDescription className="text-center text-base">
						Hemos actualizado la forma en que se registran las actividades en los permisos de
						trabajo.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2 text-sm">
						<p>
							Ahora cada actividad incluye campos detallados para identificar{" "}
							<strong>peligros</strong>, <strong>riesgos asociados</strong> y{" "}
							<strong>medidas de control</strong> de forma individual.
						</p>

						<ul className="text-muted-foreground list-inside list-disc space-y-1">
							<li>Cada actividad tiene sus propios peligros, riesgos y medidas de control</li>
							<li>Los campos de riesgos y medidas globales fueron reemplazados</li>
							<li>
								Las medidas de control están organizadas por categoría para facilitar la búsqueda
							</li>
						</ul>
					</div>

					<div className="overflow-hidden rounded-lg border">
						<Image
							width={480}
							height={300}
							className="h-auto w-full"
							alt="Ejemplo del nuevo formato de actividades"
							src="/images/work-permit-activity-changes.png"
						/>
					</div>
				</div>

				<Button onClick={handleClose} className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700">
					Entendido
				</Button>
			</DialogContent>
		</Dialog>
	)
}
