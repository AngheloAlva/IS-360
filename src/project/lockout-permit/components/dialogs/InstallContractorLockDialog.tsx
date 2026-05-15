"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LockKeyhole } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { installContractorLock } from "../../actions/installContractorLock"
import { queryClient } from "@/lib/queryClient"
import {
	InstallContractorLockSchema,
	installContractorLockSchema,
} from "../../schemas/install-contractor-lock.schema"

import { InputFormField } from "@/shared/components/forms/InputFormField"
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

interface InstallContractorLockDialogProps {
	lockoutPermitId: string
	workerName: string
	disabled?: boolean
}

export default function InstallContractorLockDialog({
	lockoutPermitId,
	workerName,
	disabled = false,
}: InstallContractorLockDialogProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<InstallContractorLockSchema>({
		resolver: zodResolver(installContractorLockSchema),
		defaultValues: {
			lockoutPermitId,
			contractorLockNumber: "",
		},
	})

	const onSubmit = async (values: InstallContractorLockSchema): Promise<void> => {
		setIsSubmitting(true)

		try {
			const res = await installContractorLock({ values })

			if (!res.ok) {
				toast.error("Error al instalar candado", {
					description: res.message,
					duration: 3000,
				})
				return
			}

			toast.success("Candado instalado exitosamente", {
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
			toast.error("Error al instalar candado", {
				duration: 3000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className="w-full justify-start gap-2 px-3 font-semibold"
					disabled={disabled}
				>
					<LockKeyhole className="h-4 w-4" />
					Instalar Candado Contratista
				</Button>
			</DialogTrigger>

			<DialogContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Instalar Candado del Contratista</DialogTitle>
							<DialogDescription>
								Registre su número de candado para el trabajador <strong>{workerName}</strong>
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-4 py-4">
							<InputFormField<InstallContractorLockSchema>
								name="contractorLockNumber"
								label="Número de Candado"
								control={form.control}
								placeholder="Ingrese el número de su candado"
							/>

							<div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
								<p className="font-semibold">Información:</p>
								<ul className="mt-1 list-inside list-disc space-y-1">
									<li>La fecha y hora se registrarán automáticamente</li>
									<li>El responsable interno también debe instalar su candado</li>
									<li>Ambos candados deben estar instalados para garantizar la seguridad</li>
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
								label="Instalar Candado"
								isSubmitting={isSubmitting}
								className="w-fit bg-cyan-500 hover:bg-cyan-600"
							/>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
