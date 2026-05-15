"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { AlertTriangleIcon, SettingsIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { updateWorkerFolderConfig } from "../../actions/worker/update-worker-folder-config"
import { ReviewStatus } from "@/generated/prisma/enums"
import {
	updateWorkerFolderConfigSchema,
	type UpdateWorkerFolderConfigSchema,
} from "../../schemas/update-worker-folder-config.schema"

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Switch } from "@/shared/components/ui/switch"
import { Label } from "@/shared/components/ui/label"
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

interface WorkerFolderConfigDialogProps {
	startupFolderId: string
	workerId: string
	workerName: string
	currentStatus: ReviewStatus
	currentIsDriver: boolean
	onSuccess?: () => void
}

const statusOptions = [
	{ value: ReviewStatus.DRAFT, label: "Borrador" },
	{ value: ReviewStatus.SUBMITTED, label: "Enviado" },
	{ value: ReviewStatus.APPROVED, label: "Aprobado" },
]

export default function WorkerFolderConfigDialog({
	startupFolderId,
	workerId,
	workerName,
	currentStatus,
	currentIsDriver,
	onSuccess,
}: WorkerFolderConfigDialogProps) {
	const [open, setOpen] = useState(false)
	const [isPending, startTransition] = useTransition()
	const [showDriverWarning, setShowDriverWarning] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(false)

	const form = useForm<UpdateWorkerFolderConfigSchema>({
		resolver: zodResolver(updateWorkerFolderConfigSchema),
		defaultValues: {
			startupFolderId,
			workerId,
			newStatus: currentStatus,
			isDriver: currentIsDriver,
			reason: "",
			confirmDeleteDriverDocs: false,
		},
	})

	const watchedIsDriver = form.watch("isDriver")
	const watchedStatus = form.watch("newStatus")
	const isRemovingDriver = currentIsDriver && !watchedIsDriver

	const hasChanges = watchedStatus !== currentStatus || watchedIsDriver !== currentIsDriver

	const onSubmit = (data: UpdateWorkerFolderConfigSchema) => {
		startTransition(async () => {
			try {
				const result = await updateWorkerFolderConfig({
					...data,
					confirmDeleteDriverDocs: isRemovingDriver ? confirmDelete : undefined,
				})

				if (!result.ok) {
					if ("requiresConfirmation" in result && result.requiresConfirmation) {
						setShowDriverWarning(true)
						return
					}
					throw new Error(result.message)
				}

				setOpen(false)
				resetDialogState()
				form.reset()
				onSuccess?.()
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Error al actualizar la configuración")
			}
		})
	}

	const resetDialogState = () => {
		setShowDriverWarning(false)
		setConfirmDelete(false)
	}

	const handleOpenChange = (value: boolean) => {
		setOpen(value)
		if (!value) {
			resetDialogState()
			form.reset({
				startupFolderId,
				workerId,
				newStatus: currentStatus,
				isDriver: currentIsDriver,
				reason: "",
				confirmDeleteDriverDocs: false,
			})
		}
	}

	const currentStatusOption = statusOptions.find((opt) => opt.value === currentStatus)

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					size="sm"
					variant="outline"
					className="h-8 w-8 p-0"
					title="Configuración de carpeta"
				>
					<SettingsIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Configuración de Carpeta</DialogTitle>
					<DialogDescription>
						Configuración de la carpeta del trabajador: <strong>{workerName}</strong>
						<br />
						<span className="mt-1 text-sm">
							Estado actual: <span className="font-semibold">{currentStatusOption?.label}</span>
							{" · "}
							{currentIsDriver ? "Conductor" : "No conductor"}
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
									<FormLabel>Estado</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger className="w-full">
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

						<SwitchFormField
							name="isDriver"
							label="¿Es conductor?"
							control={form.control}
							description={
								watchedIsDriver
									? "Se requieren 5 documentos adicionales de conductor"
									: "Solo documentos base del trabajador"
							}
						/>

						{isRemovingDriver && (
							<Alert variant="destructive">
								<AlertTriangleIcon className="h-4 w-4" />
								<div>
									<AlertTitle>Documentos de conductor</AlertTitle>
									<AlertDescription>
										Al quitar el rol de conductor, se eliminarán los documentos exclusivos de
										conductor que existan (Licencia de conducir, Examen psicosensotécnico, Curso de
										manejo defensivo, Manejo en alta montaña, Examen de alcohol y drogas).
									</AlertDescription>
								</div>
								<div className="mt-3 flex items-center gap-2">
									<Switch
										id="confirm-delete"
										checked={confirmDelete}
										onCheckedChange={setConfirmDelete}
									/>
									<Label htmlFor="confirm-delete" className="text-sm font-medium">
										Confirmo la eliminación de documentos de conductor
									</Label>
								</div>
							</Alert>
						)}

						<FormField
							control={form.control}
							name="reason"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Motivo del Cambio</FormLabel>
									<FormControl>
										<Textarea placeholder="Explique el motivo del cambio..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								className="bg-emerald-500 hover:bg-emerald-600 hover:text-white"
								disabled={isPending || !hasChanges || (isRemovingDriver && !confirmDelete)}
							>
								{isPending ? "Actualizando..." : "Guardar Cambios"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
