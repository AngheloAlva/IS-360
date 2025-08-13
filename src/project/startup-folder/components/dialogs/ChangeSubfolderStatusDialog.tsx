"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { FolderCog2Icon } from "lucide-react"
import { ReviewStatus } from "@prisma/client"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { changeSubfolderStatus } from "../../actions/change-subfolder-status"
import {
	changeSubfolderStatusSchema,
	type ChangeSubfolderStatusSchema,
} from "../../schemas/change-subfolder-status.schema"

import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogTrigger,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormMessage,
	FormControl,
} from "@/shared/components/ui/form"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"

interface ChangeSubfolderStatusDialogProps {
	startupFolderId: string
	subfolderType: ChangeSubfolderStatusSchema["subfolderType"]
	currentStatus: ReviewStatus
	entityId?: string
	entityName?: string
	onSuccess?: () => void
}

const statusOptions = [
	{ value: ReviewStatus.DRAFT, label: "Borrador" },
	{ value: ReviewStatus.SUBMITTED, label: "Enviado" },
	{ value: ReviewStatus.APPROVED, label: "Aprobado" },
]

const subfolderNames = {
	SAFETY_AND_HEALTH: "Seguridad y Salud",
	ENVIRONMENTAL: "Medio Ambiente (Antiguo)",
	ENVIRONMENT: "Medio Ambiente (Nuevo)",
	TECHNICAL_SPECS: "Especificaciones Técnicas",
	WORKER: "Personal",
	VEHICLE: "Vehículo",
	BASIC: "Documentos Básicos",
}

export default function ChangeSubfolderStatusDialog({
	startupFolderId,
	subfolderType,
	currentStatus,
	entityId,
	entityName,
	onSuccess,
}: ChangeSubfolderStatusDialogProps) {
	const [open, setOpen] = useState(false)
	const [isPending, startTransition] = useTransition()

	const form = useForm<ChangeSubfolderStatusSchema>({
		resolver: zodResolver(changeSubfolderStatusSchema),
		defaultValues: {
			startupFolderId,
			subfolderType,
			newStatus: currentStatus,
			entityId,
			reason: "",
		},
	})

	const onSubmit = (data: ChangeSubfolderStatusSchema) => {
		startTransition(async () => {
			try {
				const result = await changeSubfolderStatus(data)

				if (!result.ok) {
					throw new Error(result.message)
				}

				setOpen(false)
				form.reset()
				onSuccess?.()
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Error al actualizar el estado")
			}
		})
	}

	const currentStatusOption = statusOptions.find((opt) => opt.value === currentStatus)
	const folderDisplayName = entityName
		? `${subfolderNames[subfolderType]} - ${entityName}`
		: subfolderNames[subfolderType]

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-8 w-8 p-0"
					title="Cambiar estado manualmente"
				>
					<FolderCog2Icon className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Cambiar Estado de Subcarpeta</DialogTitle>
					<DialogDescription>
						Cambiar manualmente el estado de la subcarpeta: <strong>{folderDisplayName}</strong>
						<br />
						<span className="mt-1 text-sm">
							Estado actual: <span className={"font-bold"}>{currentStatusOption?.label}</span>
						</span>
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="newStatus"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nuevo Estado</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Seleccionar nuevo estado" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{statusOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													<span>{option.label}</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="reason"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Motivo del Cambio</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Explique el motivo del cambio manual de estado..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								className="bg-emerald-500 hover:bg-emerald-600 hover:text-white"
								disabled={isPending || form.watch("newStatus") === currentStatus}
							>
								{isPending ? "Actualizando..." : "Actualizar Estado"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
