"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DocumentCategory } from "@prisma/client"
import { z } from "zod"

import { useLinkEntity } from "../../hooks/use-link-entity"
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
import { Button } from "@/shared/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select"
import { toast } from "sonner"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"

const linkEntitySchema = z.object({
	isDriver: z.boolean().default(false).optional(),
	entityId: z.string().min(1, "Seleccione una entidad"),
})

interface LinkEntityDialogProps {
	category: DocumentCategory
	startupFolderId: string
	userId: string
	entities: Array<{ id: string; name: string }>
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

export function LinkEntityDialog({
	category,
	startupFolderId,
	entities,
	isOpen,
	userId,
	onClose,
	onSuccess,
}: LinkEntityDialogProps) {
	const linkEntity = useLinkEntity()

	const form = useForm<z.infer<typeof linkEntitySchema>>({
		resolver: zodResolver(linkEntitySchema),
		defaultValues: {
			entityId: "",
			isDriver: false,
		},
	})

	const onSubmit = async (data: z.infer<typeof linkEntitySchema>) => {
		linkEntity.mutate(
			{
				userId,
				category,
				startupFolderId,
				entityId: data.entityId,
				isDriver: data.isDriver,
			},
			{
				onSuccess: () => {
					toast.success("Entidad vinculada", {
						description: `${category === "VEHICLES" ? "Vehículo" : "Trabajador"} vinculado exitosamente.`,
					})
					form.reset()
					onSuccess()
					onClose()
				},
				onError: (error) => {
					if (error instanceof Error) {
						form.setError("entityId", { message: error.message })
						toast.error("Error", {
							description: error.message,
						})
					}
				},
			}
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Vincular {category === "VEHICLES" ? "Vehículo" : "Trabajador"}</DialogTitle>
					<DialogDescription>
						Seleccione {category === "VEHICLES" ? "un vehículo" : "un trabajador"} para vincular a
						esta carpeta de arranque.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="entityId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{category === "VEHICLES" ? "Vehículo" : "Trabajador"}</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={linkEntity.isPending}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={`Seleccione ${
														category === "VEHICLES" ? "un vehículo" : "un trabajador"
													}`}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{entities.map((entity) => (
												<SelectItem key={entity.id} value={entity.id}>
													{entity.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{category === DocumentCategory.PERSONNEL && (
							<SwitchFormField name="isDriver" label="¿Es conductor?" control={form.control} />
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={linkEntity.isPending}
							>
								Cancelar
							</Button>

							<Button
								className="bg-emerald-600 text-white transition-all hover:scale-105 hover:bg-emerald-700 hover:text-white"
								type="submit"
								disabled={linkEntity.isPending}
							>
								Vincular
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
