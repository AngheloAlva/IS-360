"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
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
} from "@/shared/components/ui/alert-dialog"
import { requestClosure } from "@/project/work-order/actions/requestClosure"
import { CheckCircleIcon } from "lucide-react"

interface RequestWorkBookClosureProps {
	userId: string
	workOrderId: string
	isDisabled?: boolean
}

export function RequestWorkBookClosure({
	userId,
	isDisabled,
	workOrderId,
}: RequestWorkBookClosureProps) {
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleRequestClosure = async () => {
		try {
			setIsLoading(true)
			const response = await requestClosure({ userId, workBookId: workOrderId })

			if (!response.ok) {
				throw new Error(response.message)
			}

			toast.success("La solicitud de cierre ha sido enviada al supervisor de OTC")

			router.refresh()
		} catch (error) {
			console.error("[WORK_BOOK_REQUEST_CLOSURE]", error)
			toast.error("No se pudo enviar la solicitud de cierre")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="default"
					size="lg"
					className="gap-2 bg-orange-600 font-semibold tracking-wide transition-all hover:scale-105 hover:bg-orange-700"
					disabled={isDisabled || isLoading}
				>
					{isLoading ? "Solicitando..." : "Solicitar Cierre"}
					<CheckCircleIcon className="h-4 w-4" />
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
					<AlertDialogAction
						onClick={handleRequestClosure}
						className="gap-2 bg-orange-600 font-semibold tracking-wide transition-all hover:scale-105 hover:bg-orange-700"
					>
						Solicitar Cierre
						<CheckCircleIcon className="h-4 w-4" />
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
