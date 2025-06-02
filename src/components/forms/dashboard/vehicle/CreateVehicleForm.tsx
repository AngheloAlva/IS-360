"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { VehicleTypeOptions, VEHICLE_TYPE_VALUES_ARRAY } from "@/lib/consts/vehicle-types"
import { useVehicleById } from "@/hooks/vehicles/use-vehicle-by-id"
import { updateVehicle } from "@/actions/vehicles/updateVehicle"
import { createVehicle } from "@/actions/vehicles/createVehicle"
import {
	vehicleSchema,
	VehicleSchema,
	updateVehicleSchema,
	UpdateVehicleSchema,
} from "@/lib/form-schemas/dashboard/vehicles/vehicle.schema"

import { ColorPickerFormField } from "../../shared/ColorPickerFormField"
import { SelectFormField } from "../../shared/SelectFormField"
import { InputFormField } from "../../shared/InputFormField"
import SubmitButton from "../../shared/SubmitButton"
import { Switch } from "@/components/ui/switch"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormDescription,
} from "@/components/ui/form"

interface CreateVehicleFormProps {
	vehicleId?: string | null
	companyId: string
	onSuccess?: () => void
}

export default function CreateVehicleForm({
	vehicleId,
	companyId,
	onSuccess,
}: CreateVehicleFormProps) {
	const [isLoading, setIsLoading] = useState(false)
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
					onSuccess?.()
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
					form.reset({
						plate: "",
						model: "",
						year: new Date().getFullYear(),
						brand: "",
						type: "CAR",
						color: "",
						isMain: false,
					})
					onSuccess?.()
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
					name="plate"
					label="Matrícula"
					placeholder="ABC123"
					control={form.control}
				/>

				<InputFormField<VehicleSchema>
					name="brand"
					label="Marca"
					placeholder="Toyota"
					control={form.control}
				/>

				<InputFormField<VehicleSchema>
					min={1900}
					name="year"
					label="Año"
					type="number"
					placeholder="2023"
					control={form.control}
					max={new Date().getFullYear()}
				/>

				<SelectFormField<VehicleSchema>
					name="type"
					label="Tipo"
					control={form.control}
					options={VehicleTypeOptions}
				/>

				<ColorPickerFormField<VehicleSchema> label="Color" name="color" control={form.control} />

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

				<SubmitButton
					isSubmitting={isLoading}
					className="w-full sm:col-span-2"
					label={isUpdate ? "Actualizar vehículo" : "Crear vehículo"}
				/>
			</form>
		</Form>
	)
}
