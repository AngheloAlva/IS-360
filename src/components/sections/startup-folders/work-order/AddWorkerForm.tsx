"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { UserPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { addWorkerToWorkOrder } from "@/actions/startup-folders/addWorkerToWorkOrder"

import { InputFormField } from "@/components/forms/shared/InputFormField"
import { RutFormField } from "@/components/forms/shared/RutFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
	Dialog,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/components/ui/dialog"

const workerFormSchema = z.object({
	name: z.string().min(2, {
		message: "El nombre debe tener al menos 2 caracteres.",
	}),
	rut: z.string().min(8, {
		message: "El RUT debe tener al menos 8 caracteres.",
	}),
})

type WorkerFormValues = z.infer<typeof workerFormSchema>

interface AddWorkerFormProps {
	workOrderId: string
	folderId: string
	onWorkerAdded?: () => void
}

export function AddWorkerForm({ workOrderId, folderId, onWorkerAdded }: AddWorkerFormProps) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<WorkerFormValues>({
		resolver: zodResolver(workerFormSchema),
		defaultValues: {
			name: "",
			rut: "",
		},
	})

	const onSubmit = async (values: WorkerFormValues) => {
		setIsSubmitting(true)
		try {
			const result = await addWorkerToWorkOrder({
				workOrderId,
				folderId,
				name: values.name,
				rut: values.rut,
			})

			if (result.ok) {
				toast.success("Trabajador agregado correctamente")
				form.reset()
				setOpen(false)
				if (onWorkerAdded) {
					onWorkerAdded()
				}
			} else {
				toast.error(result.message || "Error al agregar el trabajador")
			}
		} catch (error) {
			console.error("Error al agregar trabajador:", error)
			toast.error("Ha ocurrido un error al agregar el trabajador")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<UserPlus className="mr-2 h-4 w-4" />
					Agregar colaborador
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Agregar nuevo colaborador</DialogTitle>
					<DialogDescription>
						Ingresa los datos del colaborador para crear su documentación personal.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<InputFormField<WorkerFormValues>
							name="name"
							control={form.control}
							label="Nombre completo"
							placeholder="Nombre del colaborador"
						/>

						<RutFormField name="rut" label="RUT" control={form.control} />

						<DialogFooter>
							<SubmitButton isSubmitting={isSubmitting} label="Agregar colaborador" />
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
