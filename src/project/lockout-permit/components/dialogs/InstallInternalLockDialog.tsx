"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LockKeyhole } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { installInternalLock } from "../../actions/installInternalLock"
import { useOperators } from "@/shared/hooks/use-operators"
import { queryClient } from "@/lib/queryClient"
import {
	installInternalLockSchema,
	type InstallInternalLockSchema,
} from "../../schemas/install-internal-lock.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
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

interface InstallInternalLockDialogProps {
	lockoutPermitId: string
	workerName: string
	disabled?: boolean
}
export default function InstallInternalLockDialog({
	lockoutPermitId,
	workerName,
	disabled = false,
}: InstallInternalLockDialogProps): React.ReactElement {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<InstallInternalLockSchema>({
		resolver: zodResolver(installInternalLockSchema),
		defaultValues: {
			lockoutPermitId,
			internalOperatorId: "",
			internalLockNumber: "",
		},
	})

	const { data: operators, isLoading } = useOperators({
		page: 1,
		limit: 100,
	})

	const onSubmit = async (values: InstallInternalLockSchema): Promise<void> => {
		setIsSubmitting(true)

		try {
			const res = await installInternalLock({ values })

			if (!res.ok) {
				toast.error("Error al instalar candado interno", {
					description: res.message,
					duration: 3000,
				})
				return
			}

			toast.success("Candado Interno instalado exitosamente", {
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
			toast.error("Error al instalar candado interno", {
				duration: 3000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const internalOperatorId = form.watch("internalOperatorId")

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant={"ghost"}
					className="cursor-pointer items-start justify-start"
					disabled={disabled}
				>
					<LockKeyhole className="h-4 w-4" />
					Instalar Candado Interno
				</Button>
			</DialogTrigger>

			<DialogContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Instalar Candado Interno</DialogTitle>
							<DialogDescription>
								Registre el candado interno para el trabajador <strong>{workerName}</strong>
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-4 py-4">
							<SelectWithSearchFormField<InstallInternalLockSchema>
								name="internalOperatorId"
								label="Operador Interno"
								control={form.control}
								options={
									operators?.operators.map((operator) => ({
										value: operator.id,
										label: operator.name,
									})) ?? []
								}
								placeholder="Seleccione el operador"
							/>

							<InputFormField<InstallInternalLockSchema>
								name="internalLockNumber"
								label="Número de Candado Interno"
								control={form.control}
								placeholder="Ingrese el número de candado"
							/>

							<div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
								<p className="font-semibold">Información:</p>
								<ul className="mt-1 list-inside list-disc space-y-1">
									<li>La fecha y hora se registrarán automáticamente</li>
									<li>El contratista también debe instalar su candado</li>
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
								disabled={isLoading || !internalOperatorId}
								className="w-fit bg-cyan-500 hover:bg-cyan-600"
							/>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
