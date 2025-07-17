"use client"

import { CheckCircleIcon, XCircleIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { approveMilestones } from "@/project/work-order/actions/approveMilestones"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"

interface MilestoneApprovalProps {
	className?: string
	workOrderId: string
}

export function MilestoneApproval({ className, workOrderId }: MilestoneApprovalProps) {
	const [rejectionReason, setRejectionReason] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [activeTab, setActiveTab] = useState<string>("approve")

	const handleAction = async (approved: boolean) => {
		try {
			setIsLoading(true)

			if (!approved && !rejectionReason) {
				toast.error("Por favor, ingrese un motivo para el rechazo de los hitos")
				return
			}

			const response = await approveMilestones({
				approved,
				workBookId: workOrderId,
				rejectionReason: !approved ? rejectionReason : undefined,
			})

			if (!response.ok) {
				throw new Error(response.message)
			}

			toast.success(approved ? "Los hitos han sido aprobados" : "Los hitos han sido rechazados", {
				description: approved
					? "Se ha notificado al supervisor que los hitos han sido aprobados."
					: "Se ha notificado al supervisor que los hitos requieren modificaciones.",
				duration: 5000,
			})

			setIsOpen(false)
			queryClient.invalidateQueries({
				queryKey: ["workBookMilestones", { workOrderId }],
			})
			queryClient.invalidateQueries({
				queryKey: ["workBooks", { workOrderId }],
			})
		} catch (error) {
			console.error("[MILESTONE_APPROVAL]", error)
			toast.error(
				`No se pudieron ${
					activeTab === "approve" ? "aprobar" : "rechazar"
				} los hitos del libro de obras`
			)
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
				>
					<CheckCircleIcon className="mr-2 h-5 w-5" />
					<span>Validar Hitos</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="max-w-2xl">
				<AlertDialogHeader>
					<AlertDialogTitle>Validación de Hitos</AlertDialogTitle>
					<AlertDialogDescription>
						Revise los hitos del libro de obras y decida si los aprueba o requieren modificaciones.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="approve" className="data-[state=active]:bg-green-500/20">
							<CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
							Aprobar
						</TabsTrigger>
						<TabsTrigger value="reject" className="data-[state=active]:bg-red-500/20">
							<XCircleIcon className="mr-2 h-4 w-4 text-red-500" />
							Solicitar Cambios
						</TabsTrigger>
					</TabsList>

					<TabsContents>
						<TabsContent value="approve" className="mt-4 space-y-4">
							<div className="rounded-md border border-green-500 bg-green-500/20 p-4">
								<h3 className="text-text mb-2 font-semibold">Aprobar Hitos</h3>
								<p className="text-text text-sm">
									Al aprobar los hitos, el supervisor podrá comenzar a registrar actividades
									asociadas a estos hitos. Esta acción enviará una notificación al supervisor.
								</p>
							</div>
						</TabsContent>

						<TabsContent value="reject" className="mt-4 space-y-4">
							<div className="rounded-md border border-red-500 bg-red-500/20 p-4">
								<h3 className="text-text mb-2 font-semibold">Solicitar Modificaciones</h3>
								<p className="text-text text-sm">
									Si los hitos requieren cambios, indique el motivo para que el supervisor pueda
									realizar las modificaciones necesarias. Esta acción enviará una notificación al
									supervisor.
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="rejectionReason">Motivo de la solicitud de cambios</Label>
								<Textarea
									id="rejectionReason"
									value={rejectionReason}
									className="h-28 max-h-52"
									onChange={(e) => setRejectionReason(e.target.value)}
									placeholder="Indique los cambios necesarios o el motivo del rechazo..."
								/>
							</div>
						</TabsContent>
					</TabsContents>
				</Tabs>

				<AlertDialogFooter className="mt-6 gap-2">
					<Button
						type="button"
						variant="outline"
						disabled={isLoading}
						onClick={() => setIsOpen(false)}
					>
						Cancelar
					</Button>

					{activeTab === "approve" ? (
						<Button
							disabled={isLoading}
							onClick={() => handleAction(true)}
							className="bg-green-500 text-white hover:bg-green-600 hover:text-white"
						>
							<CheckCircleIcon className="mr-2 h-4 w-4" />
							Aprobar Hitos
						</Button>
					) : (
						<Button
							disabled={isLoading || !rejectionReason}
							onClick={() => handleAction(false)}
							className="bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
						>
							<XCircleIcon className="mr-2 h-4 w-4" />
							Solicitar Cambios
						</Button>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
