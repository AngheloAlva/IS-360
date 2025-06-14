"use client"

import { Check, ChevronsUpDown, PlusCircleIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createMaintenancePlan } from "@/features/maintenance-plan/actions/createMaintenancePlan"
import { useEquipments } from "@/features/equipment/hooks/use-equipments"
import { PlanLocationOptions } from "@/lib/consts/plan-location"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"
import {
	maintenancePlanSchema,
	type MaintenancePlanSchema,
} from "@/features/maintenance-plan/schemas/maintenance-plan.schema"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
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
}

export default function MaintenancePlanForm({
	userId,
}: MaintenancePlanFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<MaintenancePlanSchema>({
		resolver: zodResolver(maintenancePlanSchema),
		defaultValues: {
			name: "",
			createdById: userId,
			location: undefined,
			equipmentId: undefined,
		},
	})

	const { data: equipments, isLoading: isEquipmentsLoading } = useEquipments({ limit: 1000 })

	const onSubmit = async (values: MaintenancePlanSchema) => {
		setIsSubmitting(true)
		try {
			const { ok, message, code } = await createMaintenancePlan({ values })

			if (ok) {
				toast.success("Plan de mantenimiento creado exitosamente", {
					description: "El plan de mantenimiento ha sido creado exitosamente",
					duration: 3000,
				})

				setOpen(false)
				queryClient.invalidateQueries({
					queryKey: ["maintenance-plans"],
				})
				form.reset()
			} else {
				if (code === "NAME_ALREADY_EXISTS") {
					toast.error("El nombre del plan de mantenimiento ya existe", {
						description: "Por favor, elige un nombre único para el plan de mantenimiento",
						duration: 5000,
						className: "bg-red-500/10 border border-red-500 text-white",
					})
				} else {
					toast.error("Error al crear el plan de mantenimiento", {
						description: message,
						duration: 5000,
					})
				}
			}
		} catch (error) {
			console.log(error)
			toast.error("Error al crear el plan de mantenimiento", {
				description: "Ocurrió un error al intentar crear el plan de mantenimiento",
				duration: 5000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					size={"lg"}
					className="gap-1.5 bg-white font-medium text-indigo-600 transition-all hover:scale-105 hover:bg-white hover:text-indigo-600"
				>
					<PlusCircleIcon />
					Plan de Mantenimiento
				</Button>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader className="shadow">
					<SheetTitle>Crear Plan de Mantenimiento</SheetTitle>
					<SheetDescription>
						Complete el formulario para crear un nuevo plan de mantenimiento.
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
							placeholder="Nombre del plan de mantenimiento"
							className="sm:col-span-2"
						/>

						<SelectFormField<MaintenancePlanSchema>
							name="location"
							label="Ubicación"
							control={form.control}
							options={PlanLocationOptions}
							placeholder="Selecciona la ubicación"
						/>

						<FormField
							control={form.control}
							name="equipmentId"
							render={({ field }) => (
								<FormItem className="flex flex-col sm:col-span-2">
									<FormLabel>Equipo</FormLabel>
									<Popover modal>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
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
														: "Seleccionar equipo"}
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
																	{equipment.name}
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
							variant="outline"
							onClick={() => setOpen(false)}
							className="border-2 border-indigo-600 tracking-wide text-indigo-500 transition-all hover:scale-105 hover:bg-transparent hover:text-indigo-500"
						>
							Cancelar
						</Button>

						<SubmitButton
							label="Crear Plan"
							isSubmitting={isSubmitting}
							className="bg-indigo-600 hover:bg-indigo-700"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
