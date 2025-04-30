"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { approveWorkBookClosure } from "@/actions/work-orders/approveClosure"
import { rejectClosure } from "@/actions/work-orders/rejectClosure"
import { cn } from "@/lib/utils"
import { Check, CircleCheckBig, X } from "lucide-react"

interface ApproveWorkBookClosureProps {
	userId: string
	className?: string
	workOrderId: string
	isDisabled?: boolean
}

export function ApproveWorkBookClosure({
	userId,
	className,
	isDisabled,
	workOrderId,
}: ApproveWorkBookClosureProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [rejectionReason, setRejectionReason] = useState("")
	const router = useRouter()

	const handleAction = async (action: "approve" | "reject") => {
		try {
			setIsLoading(true)

			if (action === "reject" && !rejectionReason) {
				toast.error("Por favor, ingrese una razón de rechazo")
				return
			}

			if (action === "approve") {
				const response = await approveWorkBookClosure({
					workBookId: workOrderId,
					userId,
				})

				if (!response.ok) {
					throw new Error(response.message)
				}

				toast.success("El libro de obras ha sido cerrado exitosamente", {
					description:
						"Se ha actualizado el estado del libro de obras y enviado un correo al supervisor que solicitó el cierre",
					duration: 5000,
				})
				setIsOpen(false)
				router.refresh()
				return
			}

			const response = await rejectClosure({
				userId,
				workBookId: workOrderId,
				reason: rejectionReason,
			})

			if (!response.ok) {
				throw new Error(response.message)
			}

			toast.success("La solicitud de cierre ha sido rechazada", {
				description:
					"Se ha actualizado el estado del libro de obras y enviado un correo al supervisor que solicitó el cierre",
				duration: 5000,
			})

			setIsOpen(false)
			router.refresh()
		} catch (error) {
			console.error("[WORK_BOOK_REJECT_CLOSURE]", error)
			toast.error(`No se pudo ${action === "approve" ? "aprobar" : "rechazar"} el cierre`)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button
					size={"lg"}
					className={cn(
						"bg-amber-500 font-semibold text-white hover:bg-amber-600 hover:text-white",
						className
					)}
					disabled={isDisabled || isLoading}
				>
					<CircleCheckBig />
					<span className="hidden lg:block">
						{isLoading ? "Procesando..." : "Revisar Solicitud de Cierre"}
					</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="max-w-2xl">
				<AlertDialogHeader>
					<AlertDialogTitle>Revisar solicitud de cierre</AlertDialogTitle>
					<AlertDialogDescription>
						Revise el libro de obras y decida si aprueba o rechaza la solicitud de cierre.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="reason">
							Razón del rechazo <span className="text-muted-foreground">(opcional)</span>
						</Label>
						<Textarea
							id="reason"
							className="h-28 max-h-52"
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							placeholder="Ingrese la razón por la que rechaza el cierre..."
						/>
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						className="mr-auto"
						disabled={isLoading}
						onClick={() => setIsOpen(false)}
					>
						Cancelar
					</Button>
					<Button
						disabled={isLoading}
						variant="destructive"
						onClick={() => handleAction("reject")}
						className="bg-red-500 text-white hover:bg-red-600"
					>
						<X />
						Rechazar Cierre
					</Button>
					<Button
						disabled={isLoading}
						onClick={() => handleAction("approve")}
						className="bg-green-500 text-white hover:bg-green-600 hover:text-white"
					>
						<Check />
						Aprobar Cierre
					</Button>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	)
}
