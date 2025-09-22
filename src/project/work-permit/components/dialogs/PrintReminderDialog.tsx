"use client"

import { useEffect, useState } from "react"
import { PrinterIcon } from "lucide-react"

import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"

interface PrintReminderDialogProps {
	isOpen: boolean
	onClose: () => void
}

export default function PrintReminderDialog({ isOpen, onClose }: PrintReminderDialogProps) {
	const [canClose, setCanClose] = useState(false)
	const [countdown, setCountdown] = useState(3)

	useEffect(() => {
		if (isOpen) {
			setCountdown(3)
			setCanClose(false)

			const timer = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						setCanClose(true)
						clearInterval(timer)
						return 0
					}
					return prev - 1
				})
			}, 1000)

			return () => clearInterval(timer)
		}
	}, [isOpen])

	const handleClose = () => {
		if (canClose) {
			onClose()
		}
	}

	return (
		<AlertDialog open={isOpen} onOpenChange={canClose ? onClose : undefined}>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
						<PrinterIcon className="h-6 w-6 text-purple-500" />
					</div>
					<AlertDialogTitle className="text-xl font-semibold">
						¡Permiso de Trabajo Creado!
					</AlertDialogTitle>

					<AlertDialogDescription className="text-base">
						<p className="text-base font-medium text-white/90">
							Recuerda imprimir este permiso y llevarlo firmado a las instalaciones de OTC. Para mas
							información consulta el modulo de &quot;Tutoriales&quot;.
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="mt-2 flex-col gap-2 sm:flex-col">
					<AlertDialogAction
						onClick={handleClose}
						disabled={!canClose}
						className="w-full bg-violet-500 text-white hover:bg-violet-600"
					>
						{canClose ? (
							"Entendido"
						) : (
							<>
								Espera {countdown} segundo{countdown !== 1 ? "s" : ""}...
							</>
						)}
					</AlertDialogAction>
					<p className="text-center text-xs text-gray-400">
						Este mensaje se puede cerrar en {canClose ? 0 : countdown} segundos
					</p>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
