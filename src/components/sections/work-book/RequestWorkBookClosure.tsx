"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { requestClosure } from "@/actions/work-orders/requestClosure"

interface RequestWorkBookClosureProps {
	userId: string
	workOrderId: string
	isDisabled?: boolean
}

export function RequestWorkBookClosure({
	userId,
	workOrderId,
	isDisabled,
}: RequestWorkBookClosureProps) {
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleRequestClosure = async () => {
		try {
			setIsLoading(true)
			const response = await requestClosure({ userId, workBookId: workOrderId })

			if (!response.ok) {
				throw new Error("Error al solicitar el cierre")
			}

			toast.success("La solicitud de cierre ha sido enviada al supervisor de OTC")

			router.refresh()
		} catch {
			toast.error("No se pudo enviar la solicitud de cierre")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="default" className="gap-2" disabled={isDisabled || isLoading}>
					{isLoading ? "Solicitando..." : "Solicitar Cierre"}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Solicitar cierre del libro de obras?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción enviará una solicitud al supervisor de OTC para revisar y aprobar el cierre
						del libro de obras. Una vez aprobado, no se podrán agregar más entradas.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction onClick={handleRequestClosure}>Solicitar Cierre</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
