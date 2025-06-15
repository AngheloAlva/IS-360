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

const linkEntitySchema = z.object({
	entityId: z.string().min(1, "Seleccione una entidad"),
})

interface LinkEntityDialogProps {
	category: DocumentCategory
	startupFolderId: string
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
	onClose,
	onSuccess,
}: LinkEntityDialogProps) {
	const linkEntity = useLinkEntity()

	const form = useForm<z.infer<typeof linkEntitySchema>>({
		resolver: zodResolver(linkEntitySchema),
		defaultValues: {
			entityId: "",
		},
	})

	const onSubmit = async (data: z.infer<typeof linkEntitySchema>) => {
		linkEntity.mutate(
			{
				startupFolderId,
				entityId: data.entityId,
				category,
			},
			{
				onSuccess: () => {
					toast.success("Entidad vinculada", {
						description: `${category === "PERSONNEL" ? "Trabajador" : "Vehículo"} vinculado exitosamente.`,
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
					<DialogTitle>Vincular {category === "PERSONNEL" ? "Trabajador" : "Vehículo"}</DialogTitle>
					<DialogDescription>
						Seleccione {category === "PERSONNEL" ? "un trabajador" : "un vehículo"} para vincular a
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
									<FormLabel>{category === "PERSONNEL" ? "Trabajador" : "Vehículo"}</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={linkEntity.isPending}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={`Seleccione ${
														category === "PERSONNEL" ? "un trabajador" : "un vehículo"
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

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={linkEntity.isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={linkEntity.isPending}>
								Vincular
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
