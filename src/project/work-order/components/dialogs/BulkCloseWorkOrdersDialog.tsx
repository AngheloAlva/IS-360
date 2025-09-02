"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { bulkCloseWorkOrders } from "../../actions/bulk-close-work-orders"
import { useWorkOrderSelectionStore } from "../../stores/work-order-selection-store"

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
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"

interface BulkCloseWorkOrdersDialogProps {
	workOrders: Array<{ id: string; otNumber: string; workRequest: string }>
	onSuccess?: () => void
}

export default function BulkCloseWorkOrdersDialog({
	workOrders,
	onSuccess,
}: BulkCloseWorkOrdersDialogProps) {
	const { clearSelection, getSelectedCount } = useWorkOrderSelectionStore()
	const [isPending, startTransition] = useTransition()
	const [reason, setReason] = useState("")
	const [open, setOpen] = useState(false)

	const selectedCount = getSelectedCount()

	const handleClose = () => {
		if (isPending) return

		startTransition(async () => {
			try {
				const workOrderIds = workOrders.map((wo) => wo.id)

				const result = await bulkCloseWorkOrders({
					workOrderIds,
					reason: reason.trim() || undefined,
				})

				if (result.ok) {
					toast.success(result.message)
					clearSelection()
					onSuccess?.()
					setOpen(false)
					setReason("")
				}
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Error al cerrar órdenes de trabajo")
			}
		})
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button
					size={"sm"}
					variant="destructive"
					disabled={selectedCount === 0}
					className="bg-red-600 hover:bg-red-700"
				>
					Cerrar OTs Selec. ({selectedCount})
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="max-w-2xl">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						Cerrar Órdenes de Trabajo
					</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className="space-y-4">
							<p>
								¿Estás seguro de que deseas cerrar las siguientes {workOrders.length} órdenes de
								trabajo? Esta acción no se puede deshacer.
							</p>

							<div className="bg-muted/20 max-h-60 overflow-y-auto rounded-md border p-3">
								<div className="space-y-2">
									{workOrders.map((workOrder) => (
										<div
											key={workOrder.id}
											className="bg-background flex items-center justify-between rounded border p-2"
										>
											<div className="flex-1">
												<div className="text-sm font-medium">{workOrder.otNumber}</div>
												<div className="text-muted-foreground line-clamp-2 text-xs">
													{workOrder.workRequest}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="reason">Razón del cierre (opcional)</Label>
								<Textarea
									id="reason"
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="Describe el motivo del cierre masivo..."
									className="min-h-[80px]"
								/>
							</div>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleClose}
						disabled={isPending}
						className="bg-red-600 hover:bg-red-700 hover:text-white"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Cerrando...
							</>
						) : (
							`Cerrar ${workOrders.length} Órdenes`
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
