"use client"

import { AlertTriangleIcon, LockKeyholeOpen } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { type RemoveLockSchema, removeLockSchema } from "../../schemas/remove-lock.schema"
import { removeLock } from "../../actions/removeLock"
import { queryClient } from "@/lib/queryClient"

import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
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

interface RemoveLockDialogProps {
	lockoutRegistrationId: string
	workerName: string
	lockType: "otc" | "contractor"
	disabled?: boolean
}

export default function RemoveLockDialog({
	lockoutRegistrationId,
	workerName,
	lockType,
	disabled = false,
}: RemoveLockDialogProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<RemoveLockSchema>({
		resolver: zodResolver(removeLockSchema),
		defaultValues: {
			lockoutRegistrationId,
			lockType,
		},
	})

	const onSubmit = async (values: RemoveLockSchema): Promise<void> => {
		setIsSubmitting(true)

		try {
			const res = await removeLock({ values })

			if (!res.ok) {
				toast.error("Error al retirar candado", {
					description: res.message,
					duration: 3000,
				})
				return
			}

			toast.success("Candado retirado exitosamente", {
				duration: 3000,
			})

   void queryClient.invalidateQueries({
				queryKey: ["lockoutPermits"],
			})
   void queryClient.invalidateQueries({
				queryKey: ["workPermits"],
			})

			setOpen(false)
			form.reset()
		} catch (error) {
			console.error(error)
			toast.error("Error al retirar candado", {
				duration: 3000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const lockTypeLabel = lockType === "otc" ? "OTC" : "del Contratista"

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					disabled={disabled}
					className="w-full cursor-pointer items-start justify-start"
				>
					<LockKeyholeOpen className="mr-2 h-4 w-4" />
					Retirar Candado {lockType === "otc" ? "OTC" : "Contratista"}
				</Button>
			</DialogTrigger>

			<DialogContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Retirar Candado {lockTypeLabel}</DialogTitle>
							<DialogDescription>
								¿Está seguro de retirar el candado {lockTypeLabel.toLowerCase()} del trabajador{" "}
								<strong>{workerName}</strong>?
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-4 py-4">
							<div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
								<p className="flex items-center gap-1 font-semibold">
									<AlertTriangleIcon className="size-4" /> Advertencia:
								</p>
								<ul className="mt-1 list-inside list-disc space-y-1">
									<li>Esta acción confirmará el retiro del candado</li>
									<li>La fecha y hora se registrarán automáticamente</li>
								</ul>
							</div>
						</div>

						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancelar
								</Button>
							</DialogClose>

							<SubmitButton
								label="Confirmar Retiro"
								isSubmitting={isSubmitting}
								className="h-9 w-fit bg-red-500 hover:bg-red-600"
							/>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
