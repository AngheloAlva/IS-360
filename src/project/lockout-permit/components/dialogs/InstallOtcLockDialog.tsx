"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LockKeyhole } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { installOtcLock } from "../../actions/installOtcLock"
import { useOperators } from "@/shared/hooks/use-operators"
import { queryClient } from "@/lib/queryClient"
import {
	installOtcLockSchema,
	type InstallOtcLockSchema,
} from "../../schemas/install-otc-lock.schema"

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

interface InstallOtcLockDialogProps {
	lockoutPermitId: string
	workerName: string
	disabled?: boolean
}
export default function InstallOtcLockDialog({
	lockoutPermitId,
	workerName,
	disabled = false,
}: InstallOtcLockDialogProps): React.ReactElement {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<InstallOtcLockSchema>({
		resolver: zodResolver(installOtcLockSchema),
		defaultValues: {
			lockoutPermitId,
			otcOperatorId: "",
			otcLockNumber: "",
		},
	})

	const { data: operators, isLoading } = useOperators({
		page: 1,
		limit: 100,
	})

	const onSubmit = async (values: InstallOtcLockSchema): Promise<void> => {
		setIsSubmitting(true)

		try {
			const res = await installOtcLock({ values })

			if (!res.ok) {
				toast.error("Error al instalar candado de OTC", {
					description: res.message,
					duration: 3000,
				})
				return
			}

			toast.success("Candado de OTC instalado exitosamente", {
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
			toast.error("Error al instalar candado de OTC", {
				duration: 3000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const otcOperatorId = form.watch("otcOperatorId")

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant={"ghost"}
					className="cursor-pointer items-start justify-start"
					disabled={disabled}
				>
					<LockKeyhole className="h-4 w-4" />
					Instalar Candado OTC
				</Button>
			</DialogTrigger>

			<DialogContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Instalar Candado de OTC</DialogTitle>
							<DialogDescription>
								Registre el candado de OTC para el trabajador <strong>{workerName}</strong>
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-4 py-4">
							<SelectWithSearchFormField<InstallOtcLockSchema>
								name="otcOperatorId"
								label="Operador de OTC"
								control={form.control}
								options={
									operators?.operators.map((operator) => ({
										value: operator.id,
										label: operator.name,
									})) ?? []
								}
								placeholder="Seleccione el operador"
							/>

							<InputFormField<InstallOtcLockSchema>
								name="otcLockNumber"
								label="Número de Candado OTC"
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
								disabled={isLoading || !otcOperatorId}
								className="w-fit bg-cyan-500 hover:bg-cyan-600"
							/>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
