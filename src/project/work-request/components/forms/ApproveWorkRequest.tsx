"use client"

import { ClipboardCheckIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { approveOrRejectWorkRequest } from "../../actions/approveOrRejectRequest"
import { queryClient } from "@/lib/queryClient"

import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Spinner } from "@/shared/components/ui/spinner"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import {
	Dialog,
	DialogClose,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

export default function ApproveWorkRequest({
	userId,
	workRequestId,
}: {
	userId: string
	workRequestId: string
}): React.ReactElement {
	const [action, setAction] = useState<"approve" | "reject">("approve")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const onSubmit = async () => {
		try {
			setIsSubmitting(true)
			const res = await approveOrRejectWorkRequest({ workRequestId, userId, action })

			if (!res.ok) {
				toast.error("Error al aprobar la solicitud de trabajo", {
					description: res.message,
					duration: 3000,
				})
				return
			}

			toast.success("Solicitud de trabajo aprobada exitosamente", {
				duration: 3000,
			})
			queryClient.invalidateQueries({
				queryKey: ["workRequests"],
			})
			setOpen(false)
			setIsSubmitting(false)
		} catch (error) {
			console.error(error)
			toast.error("Error al aprobar la solicitud de trabajo", {
				duration: 3000,
			})
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="hover:bg-accent hover:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:hover:bg-destructive/10 dark:data-[variant=destructive]:hover:bg-destructive/40 data-[variant=destructive]:hover:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
				<ClipboardCheckIcon className="h-4 w-4 text-cyan-500" />
				Aprobar solicitud
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Aprobar o Rechazar Solicitud de Trabajo</DialogTitle>
					<DialogDescription>¿Estás seguro de aprobar esta solicitud de trabajo?</DialogDescription>
				</DialogHeader>

				<div>
					<RadioGroup
						value={action}
						onValueChange={(value) => setAction(value as "approve" | "reject")}
					>
						<div className="flex items-center gap-3">
							<RadioGroupItem value="approve" id="approve" />
							<Label htmlFor="approve">Aprobar</Label>
						</div>

						<div className="flex items-center gap-3">
							<RadioGroupItem value="reject" id="reject" />
							<Label htmlFor="reject">Rechazar</Label>
						</div>
					</RadioGroup>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline">
							Cancelar
						</Button>
					</DialogClose>

					<Button
						onClick={onSubmit}
						disabled={isSubmitting}
						className="cursor-pointer bg-cyan-500 transition-all hover:scale-105 hover:bg-cyan-600"
					>
						{isSubmitting ? <Spinner /> : action === "approve" ? "Aprobar" : "Rechazar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
