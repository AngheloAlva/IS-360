"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"

const saveDashboardSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().optional(),
})

type FormValues = z.infer<typeof saveDashboardSchema>

interface SaveDashboardDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	// En una implementación más completa, se pasarían aquí los datos del dashboard
	// dashboardConfig: DashboardConfig
}

export function SaveDashboardDialog({ open, onOpenChange }: SaveDashboardDialogProps) {
	const [isSaving, setIsSaving] = useState(false)

	const form = useForm<FormValues>({
		resolver: zodResolver(saveDashboardSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	})

	const onSubmit = async (values: FormValues) => {
		try {
			setIsSaving(true)

			// En una implementación real, aquí se guardaría la configuración
			// await saveDashboardConfiguration({
			//   ...values,
			//   config: dashboardConfig
			// })

			// Simulación de guardado
			await new Promise((resolve) => setTimeout(resolve, 1000))

			toast("Dashboard guardado", {
				description: `El dashboard "${values.name}" ha sido guardado exitosamente.`,
			})

			form.reset()
			onOpenChange(false)
		} catch (error) {
			console.error(error)
			toast("Error al guardar", {
				description: "No se pudo guardar la configuración del dashboard.",
			})
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Guardar dashboard</DialogTitle>
					<DialogDescription>
						Guarda esta configuración de dashboard para usarla más tarde.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre</FormLabel>
									<FormControl>
										<Input placeholder="Mi dashboard" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descripción (opcional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Descripción del dashboard"
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancelar
							</Button>
							<Button type="submit" disabled={isSaving}>
								{isSaving ? "Guardando..." : "Guardar"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
