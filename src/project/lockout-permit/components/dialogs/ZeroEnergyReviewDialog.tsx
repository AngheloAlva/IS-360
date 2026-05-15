"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ZapIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createZeroEnergyReview } from "../../actions/create-zero-energy-review"
import { queryClient } from "@/lib/queryClient"
import {
	ZeroEnergyReviewSchema,
	zeroEnergyReviewSchema,
} from "../../schemas/zero-energy-review.schema"

import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
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

interface ZeroEnergyReviewDialogProps {
	lockoutPermitId: string
	equipments: Array<{
		id: string
		name: string
		tag?: string
	}>
	trigger?: React.ReactNode
}

export default function ZeroEnergyReviewDialog({
	lockoutPermitId,
	equipments,
	trigger,
}: ZeroEnergyReviewDialogProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<ZeroEnergyReviewSchema>({
		resolver: zodResolver(zeroEnergyReviewSchema),
		defaultValues: {
			lockoutPermitId,
			equipmentId: "",
			action: "",
			location: "",
			reviewedZero: false,
		},
	})

	const onSubmit = async (values: ZeroEnergyReviewSchema): Promise<void> => {
		setIsSubmitting(true)

		try {
			const res = await createZeroEnergyReview({ values })

			if (!res.ok) {
				toast.error("Error al crear revisión", {
					description: res.message,
					duration: 3000,
				})
				return
			}

			toast.success("Revisión creada exitosamente", {
				duration: 3000,
			})

   void queryClient.invalidateQueries({
				queryKey: ["lockoutPermits"],
			})
   void queryClient.invalidateQueries({
				queryKey: ["workPermits"],
			})

			setOpen(false)
			form.reset({
				lockoutPermitId,
				equipmentId: "",
				action: "",
				location: "",
				reviewedZero: false,
			})
		} catch (error) {
			console.error("[ZERO_ENERGY_REVIEW_DIALOG]", error)
			toast.error("Error al crear revisión", {
				description: "Ocurrió un error al intentar crear la revisión",
				duration: 3000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="ghost" className="w-full cursor-pointer items-start justify-start">
						<ZapIcon className="mr-2 h-4 w-4 text-fuchsia-600" />
						Agregar Revisión Energía Cero
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<div className="flex items-center gap-2">
								<ZapIcon className="h-6 w-6 rounded-sm bg-fuchsia-600/10 p-1 text-fuchsia-600" />
								<div>
									<DialogTitle>Nueva Revisión de Energía Cero</DialogTitle>
									<DialogDescription>
										Registre una nueva revisión de energía cero para el permiso de bloqueo.
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						<div className="flex flex-col gap-4 py-4">
							<SelectFormField<ZeroEnergyReviewSchema>
								label="Equipo"
								control={form.control}
								name="equipmentId"
								options={equipments.map((equipment) => ({
									value: equipment.id,
									label: equipment.name,
								}))}
							/>

							<InputFormField<ZeroEnergyReviewSchema>
								control={form.control}
								label="Acción a Realizar"
								name="action"
								placeholder="Ej: Verificar desconexión eléctrica"
							/>

							<InputFormField<ZeroEnergyReviewSchema>
								optional
								label="Ubicación"
								control={form.control}
								name="location"
								placeholder="Ubicación específica del equipo"
							/>

							<SwitchFormField<ZeroEnergyReviewSchema>
								control={form.control}
								label="¿Se verificó energía cero?"
								className="data-[state=checked]:bg-fuchsia-500"
								name="reviewedZero"
							/>

							<div className="rounded-md bg-fuchsia-50 p-3 text-sm text-fuchsia-800">
								<p className="font-semibold">Información:</p>
								<ul className="mt-1 list-inside list-disc space-y-1">
									<li>La revisión se registrará automáticamente a su nombre</li>
									<li>La fecha y hora se registrarán automáticamente</li>
									<li>Puede agregar múltiples revisiones para diferentes equipos</li>
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
								label="Crear Revisión"
								isSubmitting={isSubmitting}
								className="w-fit bg-fuchsia-500 hover:bg-fuchsia-600"
							/>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
