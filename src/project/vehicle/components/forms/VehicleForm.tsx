"use client"

import { FileEditIcon, PlusCircleIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { VehicleTypeOptions, VEHICLE_TYPE_VALUES_ARRAY } from "@/lib/consts/vehicle-types"
import { useVehicleById } from "@/project/vehicle/hooks/use-vehicle-by-id"
import { updateVehicle } from "@/project/vehicle/actions/updateVehicle"
import { createVehicle } from "@/project/vehicle/actions/createVehicle"
import { queryClient } from "@/lib/queryClient"
import {
	vehicleSchema,
	VehicleSchema,
	updateVehicleSchema,
	UpdateVehicleSchema,
} from "@/project/vehicle/schemas/vehicle.schema"

import { ColorPickerFormField } from "../../../../shared/components/forms/ColorPickerFormField"
import { SelectFormField } from "../../../../shared/components/forms/SelectFormField"
import { InputFormField } from "../../../../shared/components/forms/InputFormField"
import SubmitButton from "../../../../shared/components/forms/SubmitButton"
import { Button } from "@/shared/components/ui/button"
import { Switch } from "@/shared/components/ui/switch"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormDescription,
} from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetContent,
	SheetDescription,
	SheetTrigger,
} from "@/shared/components/ui/sheet"

interface VehicleFormProps {
	companyId: string
	vehicleId?: string | null
}

export default function VehicleForm({ vehicleId, companyId }: VehicleFormProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const isUpdate = !!vehicleId

	const { data: vehicleData, isLoading: isLoadingVehicle } = useVehicleById({
		vehicleId: vehicleId || "",
	})

	const form = useForm<VehicleSchema | UpdateVehicleSchema>({
		resolver: zodResolver(isUpdate ? updateVehicleSchema : vehicleSchema),
		defaultValues: {
			plate: "",
			model: "",
			brand: "",
			color: "",
			type: "CAR",
			isMain: false,
			year: undefined,
		},
	})

	useEffect(() => {
		if (isUpdate && vehicleData) {
			form.reset({
				id: vehicleData.id,
				plate: vehicleData.plate,
				model: vehicleData.model,
				year: vehicleData.year,
				brand: vehicleData.brand,
				type: vehicleData.type as (typeof VEHICLE_TYPE_VALUES_ARRAY)[number],
				color: vehicleData.color || "",
				isMain: vehicleData.isMain,
			})
		}
	}, [isUpdate, vehicleData, form])

	async function onSubmit(values: VehicleSchema | UpdateVehicleSchema) {
		setIsLoading(true)
		try {
			if (isUpdate) {
				const result = await updateVehicle({
					companyId,
					values: values as UpdateVehicleSchema,
				})

				if (result.ok) {
					toast.success("Vehículo actualizado", {
						description: result.message,
					})
					form.reset()
					setIsOpen(false)
					queryClient.invalidateQueries({
						queryKey: ["vehicles"],
					})
				} else {
					toast.error("Error", {
						description: result.message,
					})
				}
			} else {
				const result = await createVehicle({
					values: values as VehicleSchema,
					companyId,
				})

				if (result.ok) {
					toast.success("Vehículo creado", {
						description: result.message,
					})
					form.reset()
					setIsOpen(false)
					queryClient.invalidateQueries({
						queryKey: ["vehicles"],
					})
				} else {
					toast.error("Error", {
						description: result.message,
					})
				}
			}
		} catch (error) {
			console.error("Error:", error)
			toast.error("Error", {
				description: "Ha ocurrido un error inesperado",
			})
		} finally {
			setIsLoading(false)
		}
	}

	if (isUpdate && isLoadingVehicle) {
		return <div>Cargando...</div>
	}

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger
				asChild={!vehicleId}
				className="hover:bg-accent hover:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
			>
				{vehicleId ? (
					<>
						<FileEditIcon />
						Editar Vehículo/Equipo
					</>
				) : (
					<Button className="hover:bg-scale-105 gap-1.5 bg-white font-semibold text-teal-600 transition-all hover:scale-105 hover:text-teal-700">
						<PlusCircleIcon className="size-4 text-teal-600" />
						Crear Vehículo/Equipo
					</Button>
				)}
			</SheetTrigger>

			<SheetContent className="sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>{vehicleId ? "Editar Vehículo/Equipo" : "Crear Vehículo/Equipo"}</SheetTitle>
					<SheetDescription>
						{vehicleId
							? "Actualiza la información del vehículo/equipo"
							: "Puede crear un vehículo o equipo, solo el campo de modelo/nombre es obligatorio"}
					</SheetDescription>
				</SheetHeader>

				<div className="grid gap-4 px-4 py-4">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="grid space-y-4 gap-x-2 gap-y-5 sm:grid-cols-2"
						>
							<InputFormField<VehicleSchema>
								name="model"
								placeholder="Corolla"
								control={form.control}
								label="Modelo / Nombre del equipo"
							/>
							<InputFormField<VehicleSchema>
								optional
								name="plate"
								label="Matrícula"
								placeholder="ABC123"
								control={form.control}
							/>

							<InputFormField<VehicleSchema>
								optional
								name="brand"
								label="Marca"
								placeholder="Toyota"
								control={form.control}
							/>

							<InputFormField<VehicleSchema>
								optional
								min={1900}
								name="year"
								label="Año"
								type="number"
								placeholder="2023"
								control={form.control}
								max={new Date().getFullYear()}
							/>

							<SelectFormField<VehicleSchema>
								optional
								name="type"
								label="Tipo"
								control={form.control}
								options={VehicleTypeOptions}
							/>

							<ColorPickerFormField<VehicleSchema>
								optional
								label="Color"
								name="color"
								control={form.control}
							/>

							<FormField
								control={form.control}
								name="isMain"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm sm:col-span-2">
										<div className="space-y-0.5">
											<FormLabel>Vehículo principal</FormLabel>
											<FormDescription>
												Marcar este vehículo como principal para la empresa
											</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>

							<Button
								size={"lg"}
								type="button"
								variant="outline"
								className="w-full border-2 border-emerald-800 font-medium tracking-wide text-emerald-700 transition-all hover:scale-105 hover:bg-emerald-800 hover:text-white"
								onClick={() => setIsOpen(false)}
							>
								Cancelar
							</Button>

							<SubmitButton
								isSubmitting={isLoading}
								className="w-full bg-teal-600 hover:bg-teal-700"
								label={isUpdate ? "Actualizar Vehículo / Equipo" : "Crear Vehículo / Equipo"}
							/>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	)
}
