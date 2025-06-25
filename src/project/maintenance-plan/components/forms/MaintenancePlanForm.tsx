"use client"

import { Check, ChevronsUpDown, PenBoxIcon, PlusCircleIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createMaintenancePlan } from "@/project/maintenance-plan/actions/createMaintenancePlan"
import { updateMaintenancePlan } from "@/project/maintenance-plan/actions/updateMaintenancePlan"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	maintenancePlanSchema,
	type MaintenancePlanSchema,
} from "@/project/maintenance-plan/schemas/maintenance-plan.schema"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormMessage,
	FormControl,
} from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"
import {
	Command,
	CommandList,
	CommandItem,
	CommandEmpty,
	CommandGroup,
	CommandInput,
} from "@/shared/components/ui/command"

interface MaintenancePlanFormProps {
	userId: string
	initialData?: {
		name: string
		equipmentId: string
		slug: string
	}
	onClose?: () => void
}

export default function MaintenancePlanForm({
	userId,
	initialData,
	onClose,
}: MaintenancePlanFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<MaintenancePlanSchema>({
		resolver: zodResolver(maintenancePlanSchema),
		defaultValues: {
			createdById: userId,
			name: initialData?.name ?? "",
			equipmentId: initialData?.equipmentId ?? undefined,
		},
	})

	const { data: equipments, isLoading: isEquipmentsLoading } = useEquipments({ limit: 1000 })

	const onSubmit = async (values: MaintenancePlanSchema) => {
		setIsSubmitting(true)
		try {
			let response
			if (initialData) {
				response = await updateMaintenancePlan({ values, slug: initialData.slug })
			} else {
				response = await createMaintenancePlan({ values })
			}

			const { ok, message, code } = response

			if (ok) {
				toast.success(
					initialData
						? "Plan de mantenimiento actualizado exitosamente"
						: "Plan de mantenimiento creado exitosamente",
					{
						description: initialData
							? "El plan de mantenimiento ha sido actualizado exitosamente"
							: "El plan de mantenimiento ha sido creado exitosamente",
						duration: 3000,
					}
				)

				setOpen(false)
				queryClient.invalidateQueries({
					queryKey: ["maintenance-plans"],
				})
				form.reset()
				onClose?.()
			} else {
				if (code === "NAME_ALREADY_EXISTS") {
					toast.error("El nombre del plan de mantenimiento ya existe", {
						description: "Por favor, elige un nombre único para el plan de mantenimiento",
						duration: 5000,
						className: "bg-red-500/10 border border-red-500 text-white",
					})
				} else {
					toast.error(
						initialData
							? "Error al actualizar el plan de mantenimiento"
							: "Error al crear el plan de mantenimiento",
						{
							description: message,
							duration: 5000,
						}
					)
				}
			}
		} catch (error) {
			console.log(error)
			toast.error(
				initialData
					? "Error al actualizar el plan de mantenimiento"
					: "Error al crear el plan de mantenimiento",
				{
					description:
						"Ocurrió un error al intentar " +
						(initialData ? "actualizar" : "crear") +
						" el plan de mantenimiento",
					duration: 5000,
				}
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					size={initialData ? "icon" : "lg"}
					className={cn(
						"gap-1.5 bg-white font-medium text-indigo-600 transition-all hover:scale-105 hover:bg-white hover:text-indigo-600",
						{
							"size-7 bg-fuchsia-600 text-white hover:bg-fuchsia-600 hover:text-white": initialData,
						}
					)}
				>
					{initialData ? (
						<PenBoxIcon className="size-4" />
					) : (
						<>
							<PlusCircleIcon className="size-4" />
							Plan de Mantenimiento
						</>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader className="shadow">
					<SheetTitle>{initialData ? "Editar" : "Crear"} Plan de Mantenimiento</SheetTitle>
					<SheetDescription>
						Complete el formulario para {initialData ? "editar el" : "crear un nuevo"} plan de
						mantenimiento.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-2 gap-y-5 px-4 pt-4 sm:grid-cols-2"
					>
						<InputFormField<MaintenancePlanSchema>
							name="name"
							label="Nombre"
							control={form.control}
							itemClassName="sm:col-span-2"
							placeholder="Nombre del plan de mantenimiento"
						/>

						<FormField
							control={form.control}
							name="equipmentId"
							render={({ field }) => (
								<FormItem className="flex flex-col sm:col-span-2">
									<FormLabel>Equipo/Ubicación</FormLabel>
									<Popover modal>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													type="button"
													variant="outline"
													role="combobox"
													className={cn(
														"justify-between overflow-hidden",
														!field.value && "text-muted-foreground"
													)}
												>
													{field.value
														? equipments?.equipments?.find(
																(equipment) => equipment.id === field.value
															)?.name
														: "Seleccionar equipo/ubicación"}
													<ChevronsUpDown className="opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
											<Command>
												<CommandInput placeholder="Buscar equipo..." className="h-9" />

												<CommandList>
													<CommandEmpty>No equipo encontrado.</CommandEmpty>
													<CommandGroup>
														{isEquipmentsLoading ? (
															<Skeleton className="h-9 w-full" />
														) : (
															equipments?.equipments?.map((equipment) => (
																<CommandItem
																	value={equipment.name}
																	key={equipment.id}
																	onSelect={() => {
																		form.setValue("equipmentId", equipment.id)
																	}}
																	className={cn({
																		"bg-primary": equipment.id === field.value,
																	})}
																>
																	{equipment.name + "* (" + equipment.location + ")"}
																	<Check
																		className={cn(
																			"ml-auto text-white",
																			equipment.id === field.value ? "opacity-100" : "opacity-0"
																		)}
																	/>
																</CommandItem>
															))
														)}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							size={"lg"}
							type="button"
							variant="outline"
							className="mt-6"
							onClick={() => setOpen(false)}
						>
							Cancelar
						</Button>

						<SubmitButton
							label={initialData ? "Guardar Cambios" : "Crear Plan"}
							isSubmitting={isSubmitting}
							className="mt-6 bg-indigo-600 hover:bg-indigo-700 hover:text-white"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
