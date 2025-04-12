"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { companySchema, type CompanySchema } from "@/lib/form-schemas/admin/company/company.schema"
import { createCompany } from "@/actions/companies/createCompany"

import { ColorPickerFormField } from "@/components/forms/shared/ColorPickerFormField"
import { SwitchFormField } from "@/components/forms/shared/SwitchFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { RutFormField } from "@/components/forms/shared/RutFormField"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import SubmitButton from "../../shared/SubmitButton"
import { authClient } from "@/lib/auth-client"
import { USER_ROLES_VALUES } from "@/lib/consts/user-roles"
import { User } from "@prisma/client"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CreateCompanyForm(): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<CompanySchema>({
		resolver: zodResolver(companySchema),
		defaultValues: {
			rut: "",
			name: "",
			vehicles: [],
			addVehicle: false,
			supervisors: [
				{
					rut: "",
					name: "",
					email: "",
					isSupervisor: true,
				},
			],
		},
	})

	const {
		fields: vehiclesFields,
		append: appendVehicle,
		remove: removeVehicle,
	} = useFieldArray({
		control: form.control,
		name: "vehicles",
	})

	const {
		fields: supervisorsFields,
		append: appendSupervisor,
		remove: removeSupervisor,
	} = useFieldArray({
		control: form.control,
		name: "supervisors",
	})

	const needAddVehicle = form.watch("addVehicle")

	async function onSubmit(values: CompanySchema) {
		setLoading(true)

		try {
			const { ok, message, data } = await createCompany({ values })

			if (!ok || !data) {
				toast("Error al crear la empresa", {
					description: message,
					duration: 5000,
				})
				return
			}

			if (values.supervisors) {
				const results = await Promise.allSettled(
					values.supervisors?.map(async (supervisor) => {
						const temporalPassword = "123456"

						const { data: newUser, error } = await authClient.admin.createUser({
							name: supervisor.name,
							email: supervisor.email,
							password: temporalPassword,
							role: USER_ROLES_VALUES.PARTNER_COMPANY,
							data: {
								companyId: data.id,
								rut: supervisor.rut,
								isSupervisor: supervisor.isSupervisor,
							},
						})

						if (error)
							throw new Error(`Error al crear usuario ${supervisor.name}: ${error.message}`)
						return newUser
					})
				)

				const errors = results.filter(
					(result): result is PromiseRejectedResult => result.status === "rejected"
				)
				const successes = results.filter(
					(result): result is PromiseFulfilledResult<{ user: User }> =>
						result.status === "fulfilled"
				)

				if (errors.length > 0) {
					toast("Error al crear algunos usuarios", {
						description: `${successes.length} usuarios creados exitosamente. ${errors.length} usuarios fallaron.`,
						duration: 5000,
					})
					return
				}
			}

			toast("Empresa creada exitosamente", {
				description: "La empresa ha sido creada exitosamente",
				duration: 3000,
			})

			router.push("/admin/dashboard/empresas")
		} catch (error) {
			console.log(error)
			toast("Error al crear la empresa", {
				description: "Ocurrió un error al intentar crear la empresa",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-screen-lg space-y-4">
				<Card className="w-full">
					<CardContent className="grid gap-4 md:grid-cols-2">
						<InputFormField<CompanySchema>
							name="name"
							label="Nombre"
							control={form.control}
							placeholder="Nombre de la empresa"
						/>

						<RutFormField<CompanySchema>
							name="rut"
							label="RUT"
							control={form.control}
							placeholder="RUT de la empresa"
						/>
					</CardContent>
				</Card>

				<Card className="w-full">
					<CardContent className="grid gap-4 md:grid-cols-2">
						<SwitchFormField<CompanySchema>
							name="addVehicle"
							control={form.control}
							label="¿Agregar vehículos?"
							itemClassName="flex flex-row items-center gap-2 my-2.5"
							onCheckedChange={(checked) => {
								form.setValue("addVehicle", checked)

								if (checked) {
									appendVehicle({
										year: "",
										plate: "",
										brand: "",
										model: "",
										color: "",
										type: "CAR",
										isMain: true,
									})
								} else {
									removeVehicle()
								}
							}}
						/>

						{needAddVehicle && (
							<Button
								type="button"
								className="border-primary text-primary border bg-white hover:text-white md:ml-auto"
								onClick={() =>
									appendVehicle({
										year: "",
										plate: "",
										brand: "",
										model: "",
										color: "",
										type: "CAR",
										isMain: false,
									})
								}
							>
								Agregar vehículo
							</Button>
						)}
					</CardContent>
				</Card>

				{needAddVehicle &&
					vehiclesFields.map((field, index) => (
						<Card key={field.id}>
							<CardContent>
								<div className="grid gap-4 md:col-span-2 md:grid-cols-2">
									<div className="flex items-center justify-between md:col-span-2">
										<CardTitle>Vehículo {index === 0 ? "Principal" : index + 1}</CardTitle>

										{index !== 0 && (
											<Button
												type="button"
												className="border border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white md:ml-auto"
												onClick={() => removeVehicle(index)}
											>
												Eliminar #{index + 1}
											</Button>
										)}
									</div>

									<InputFormField<CompanySchema>
										label="Año"
										type="number"
										placeholder="Año"
										control={form.control}
										name={`vehicles.${index}.year`}
									/>

									<InputFormField<CompanySchema>
										label="Patente"
										placeholder="Patente"
										control={form.control}
										name={`vehicles.${index}.plate`}
									/>

									<InputFormField<CompanySchema>
										label="Marca"
										placeholder="Marca"
										control={form.control}
										name={`vehicles.${index}.brand`}
									/>

									<InputFormField<CompanySchema>
										label="Modelo"
										placeholder="Modelo"
										control={form.control}
										name={`vehicles.${index}.model`}
									/>

									<ColorPickerFormField<CompanySchema>
										label="Color"
										control={form.control}
										name={`vehicles.${index}.color`}
									/>
								</div>
							</CardContent>
						</Card>
					))}

				<Card className="w-full">
					<CardContent className="flex items-center justify-between">
						<h3 className="text-sm font-semibold">Supervisor(es)</h3>

						<Button
							type="button"
							onClick={() => appendSupervisor({ name: "", email: "", rut: "", isSupervisor: true })}
							className="border-feature hover:bg-feature text-feature border bg-white hover:text-white"
						>
							Agregar Supervisor <Plus className="ml-2" />
						</Button>
					</CardContent>
				</Card>

				{supervisorsFields.map((field, index) => (
					<Card className="w-full" key={field.id}>
						<CardContent className="grid gap-4 md:grid-cols-2">
							<div
								className={cn("grid gap-3 md:col-span-2 md:grid-cols-2", {
									"mt-6": index >= 1,
								})}
							>
								<div className="flex items-center justify-between md:col-span-2">
									<h4 className="font-medium">Datos del Supervisor {index + 1}</h4>

									<Button
										type="button"
										className="border border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white"
										onClick={() => removeSupervisor(index)}
									>
										Eliminar #{index + 1}
									</Button>
								</div>

								<InputFormField<CompanySchema>
									name={`supervisors.${index}.name`}
									label="Nombre"
									control={form.control}
									placeholder="Nombre del supervisor"
								/>

								<InputFormField<CompanySchema>
									name={`supervisors.${index}.email`}
									label="Email"
									control={form.control}
									placeholder="Email del supervisor"
								/>

								<RutFormField<CompanySchema>
									name={`supervisors.${index}.rut`}
									label="RUT"
									control={form.control}
									placeholder="RUT del supervisor"
								/>
							</div>
						</CardContent>
					</Card>
				))}

				<SubmitButton
					isSubmitting={loading}
					label={`Crear empresa${needAddVehicle ? " y vehículo(s)" : ""}`}
				/>
			</form>
		</Form>
	)
}
