"use client"

import { CircleXIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { closeWorkBook } from "@/project/work-order/actions/closeWorkBook"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"
import { Slider } from "@/shared/components/ui/slider"

interface CloseWorkBookProps {
	userId: string
	className?: string
	workOrderId: string
}

export function CloseWorkBook({ userId, className, workOrderId }: CloseWorkBookProps) {
	const [rejectionReason, setRejectionReason] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [progress, setProgress] = useState<number[]>([0])
	const [isOpen, setIsOpen] = useState<boolean>(false)

	const handleAction = async () => {
		try {
			setIsLoading(true)

			if (!rejectionReason) {
				toast.error("Por favor, ingrese una razón de cierre")
				return
			}

			const response = await closeWorkBook({
				userId,
				progress: progress[0],
				workBookId: workOrderId,
				reason: rejectionReason,
			})

			if (!response.ok) {
				throw new Error(response.message)
			}

			toast.success("El libro de obras ha sido cerrado", {
				description:
					"Se ha actualizado el estado del libro de obras y enviado un correo al supervisor de la obra.",
				duration: 5000,
			})

			setIsOpen(false)
			queryClient.invalidateQueries({
				queryKey: ["workBooks", { workOrderId }],
			})
		} catch (error) {
			console.error("[WORK_BOOK_CLOSE]", error)
			toast.error(`No se pudo cerrar el libro de obras`)
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
						"bg-red-500 font-semibold text-white hover:bg-red-600 hover:text-white",
						className
					)}
				>
					<CircleXIcon />
					<span className="hidden lg:block">Cerrar Libro de Obras</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="max-w-2xl">
				<AlertDialogHeader>
					<AlertDialogTitle>Cerrar Libro de Obras</AlertDialogTitle>
					<AlertDialogDescription className="flex flex-col">
						<span className="mb-2 font-semibold">
							¿Está seguro de que desea cerrar el libro de obras?
						</span>

						<span>Se cerrará el libro de obras y nadie más podrá modificarlo.</span>
						<span className="font-semibold text-red-500">
							SOLO HACER CIERRE EN CASO DE SER NECESARIO.
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="reason">Razón del cierre</Label>
						<Textarea
							id="reason"
							value={rejectionReason}
							className="h-28 max-h-52"
							onChange={(e) => setRejectionReason(e.target.value)}
							placeholder="Ingrese la razón por la que cierra el libro de obras..."
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="progress">Progreso de cierre</Label>

						<div className="flex items-center gap-2">
							<Slider value={progress} onValueChange={setProgress} />

							<span className="text-sm font-semibold">{progress}%</span>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						disabled={isLoading}
						onClick={() => setIsOpen(false)}
					>
						Cancelar
					</Button>

					<Button
						disabled={isLoading}
						onClick={handleAction}
						className="bg-red-500 text-white hover:bg-red-600 hover:text-white"
					>
						<CircleXIcon />
						Cerrar Libro de Obras
					</Button>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	)
}
