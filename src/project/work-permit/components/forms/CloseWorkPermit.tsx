"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { BookmarkXIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { closeWorkPermit } from "../../actions/admin/closeWorkPermit"
import { queryClient } from "@/lib/queryClient"
import {
	CloseWorkPermitSchema,
	closeWorkPermitSchema,
} from "../../schemas/close-work-permit.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { useOperators } from "@/shared/hooks/use-operators"
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

export default function CloseWorkPermit({
	workPermitId,
}: {
	workPermitId: string
}): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<CloseWorkPermitSchema>({
		resolver: zodResolver(closeWorkPermitSchema),
		defaultValues: {
			closedBy: "",
		},
	})

	const { data: operators, isLoading } = useOperators({
		page: 1,
		limit: 100,
	})

	const onSubmit = async (values: CloseWorkPermitSchema) => {
		setIsSubmitting(true)

		try {
			const res = await closeWorkPermit({ workPermitId, values })

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
			queryClient.invalidateQueries({
				queryKey: ["workPermits"],
			})
		} catch (error) {
			console.error(error)
			toast.error("Error al aprobar el permiso de trabajo", {
				duration: 3000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const closedBy = form.watch("closedBy")

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant={"ghost"} className="cursor-pointer">
					<BookmarkXIcon className="h-4 w-4 text-pink-500" />
					Cerrar Permiso
				</Button>
			</DialogTrigger>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Cerrar Permiso de Trabajo</DialogTitle>
							<DialogDescription>
								¿Estás seguro de cerrar este permiso de trabajo?
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-6">
							<SelectWithSearchFormField
								name="closedBy"
								label="Cerrado por"
								control={form.control}
								placeholder="Selecciona un operador"
								options={
									operators?.operators.map((operator) => ({
										value: operator.id,
										label: operator.name,
									})) ?? []
								}
							/>
						</div>

						<DialogFooter className="mt-4">
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancelar
								</Button>
							</DialogClose>

							<SubmitButton
								label="Cerrar Permiso"
								isSubmitting={isSubmitting}
								disabled={isLoading || closedBy === ""}
								className="cursor-pointe h-9 w-fit bg-pink-500 transition-all hover:scale-105 hover:bg-pink-600"
							/>
						</DialogFooter>
					</DialogContent>
				</form>
			</Form>
		</Dialog>
	)
}
