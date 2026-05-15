"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { updateWorkOrderLikeBook } from "@/project/work-order/actions/updateWorkOrder"
import type { WorkBookByCompany } from "@/project/work-order/hooks/use-work-books-by-company"
import { queryClient } from "@/lib/queryClient"
import {
	type InitializeWorkBookSchema,
	initializeWorkBookSchema,
} from "@/project/work-order/schemas/initialize-work-book.schema"

import { Dialog, DialogTitle, DialogHeader, DialogContent } from "@/shared/components/ui/dialog"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"

interface InitializeWorkBookDialogProps {
	workOrder: WorkBookByCompany
	open: boolean
	onOpenChange: (open: boolean) => void
	tutorialMode?: boolean
	onTutorialSubmit?: (values: InitializeWorkBookSchema) => void
}

export default function InitializeWorkBookDialog({
	workOrder,
	open,
	onOpenChange,
	tutorialMode = false,
	onTutorialSubmit,
}: InitializeWorkBookDialogProps) {
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const form = useForm<InitializeWorkBookSchema>({
		resolver: zodResolver(initializeWorkBookSchema),
		defaultValues: {
			workBookName: "",
			workBookStartDate: new Date(),
			workBookLocation: "",
		},
	})

	useEffect(() => {
		if (open) {
			navigator.geolocation.getCurrentPosition((position) => {
				form.setValue(
					"workBookLocation",
					`${position.coords.latitude},${position.coords.longitude}`
				)
			})
		}
	}, [open, form])

	async function onSubmit(values: InitializeWorkBookSchema) {
		try {
			setLoading(true)

			if (tutorialMode) {
				onTutorialSubmit?.(values)
				toast.success("Simulacion completada", {
					description: "El libro de obras se creo en modo tutorial sin afectar datos reales.",
					duration: 5000,
				})
				onOpenChange(false)
				return
			}

			const { ok, message } = await updateWorkOrderLikeBook({
				workOrderId: workOrder.id,
				values: {
					workBookName: values.workBookName,
					workBookLocation: values.workBookLocation,
					workBookStartDate: values.workBookStartDate,
				},
			})

			if (ok) {
				toast.success("Libro de obras iniciado", {
					description: message,
					duration: 5000,
				})

    void queryClient.invalidateQueries({
					queryKey: ["workBooks"],
				})

				onOpenChange(false)
				router.push(`/dashboard/libro-de-obras/${workOrder.id}`)
			} else {
				toast.error("Error al iniciar el libro de obras", {
					description: message,
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)
			toast.error("Ocurrió un error", {
				description: (error as Error).message,
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Iniciar Libro de Obras</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="bg-muted/30 space-y-2 rounded-lg border p-4">
							<div>
								<h3 className="text-sm font-semibold">Orden de Trabajo:</h3>
								<p className="text-muted-foreground text-sm">{workOrder.otNumber}</p>
							</div>
							<div>
								<h3 className="text-sm font-semibold">Trabajo Solicitado:</h3>
								<p className="text-muted-foreground text-sm">{workOrder.workRequest}</p>
							</div>
						</div>

						<div data-tutorial-id="work-book-init-name">
							<InputFormField<InitializeWorkBookSchema>
								name="workBookName"
								control={form.control}
								label="Nombre de la Obra"
								placeholder="Ingrese el nombre de la obra"
							/>
						</div>

						<div data-tutorial-id="work-book-init-date">
							<DatePickerFormField<InitializeWorkBookSchema>
								name="workBookStartDate"
								control={form.control}
								label="Fecha de Inicio"
							/>
						</div>

						<div className="flex items-center justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								disabled={loading}
								onClick={() => onOpenChange(false)}
							>
								Cancelar
							</Button>

							<div data-tutorial-id="work-book-init-submit">
								<SubmitButton
									isSubmitting={loading}
									label={tutorialMode ? "Simular creacion" : "Iniciar Libro de Obras"}
									className="w-fit bg-orange-600 hover:bg-orange-700"
								/>
							</div>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
