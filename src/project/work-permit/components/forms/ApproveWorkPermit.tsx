"use client"

import { CheckCircleIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { approveOrRejectWorkPermit } from "../../actions/admin/approveOrRejectPermit"

import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
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

export default function ApproveWorkPermit({
	userId,
	workPermitId,
}: {
	userId: string
	workPermitId: string
}): React.ReactElement {
	const [action, setAction] = useState<"approve" | "reject">("approve")

	const onSubmit = async () => {
		try {
			const res = await approveOrRejectWorkPermit({ workPermitId, userId, action })

			if (!res.ok) {
				toast.error("Error al aprobar el permiso de trabajo", {
					description: res.message,
					duration: 3000,
				})
				return
			}

			toast.success("Permiso de trabajo aprobado exitosamente", {
				duration: 3000,
			})
		} catch (error) {
			console.error(error)
			toast.error("Error al aprobar el permiso de trabajo", {
				duration: 3000,
			})
		}
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					size={"icon"}
					variant={"ghost"}
					className="cursor-pointer text-cyan-500 hover:bg-cyan-500 hover:text-white"
				>
					<CheckCircleIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Aprobar o Rechazar Permiso de Trabajo</DialogTitle>
					<DialogDescription>¿Estás seguro de aprobar este permiso de trabajo?</DialogDescription>
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
						<Button variant="outline">Cancelar</Button>
					</DialogClose>

					<Button
						onClick={onSubmit}
						className="cursor-pointer bg-cyan-500 transition-all hover:scale-105 hover:bg-cyan-600"
					>
						{action === "approve" ? "Aprobar" : "Rechazar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
