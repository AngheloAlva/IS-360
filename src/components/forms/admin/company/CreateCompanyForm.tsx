"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BuildingIcon, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { companySchema, type CompanySchema } from "@/lib/form-schemas/admin/company/company.schema"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { sendNewUserEmail } from "@/actions/emails/sendRequestEmail"
import { createCompany } from "@/actions/companies/createCompany"
import { USER_ROLES_VALUES } from "@/lib/consts/user-roles"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

import { ColorPickerFormField } from "@/components/forms/shared/ColorPickerFormField"
import { SwitchFormField } from "@/components/forms/shared/SwitchFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { RutFormField } from "@/components/forms/shared/RutFormField"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

import type { User } from "@prisma/client"

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
						const temporalPassword = generateTemporalPassword()

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

						await authClient.admin.setRole({
							userId: newUser.user.id,
							role: USER_ROLES_VALUES.SUPERVISOR,
						})

						sendNewUserEmail({
							name: supervisor.name,
							email: supervisor.email,
							password: temporalPassword,
						})
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

	const formValues = form.watch()

	return (
		<div className="flex w-full max-w-screen-xl flex-col gap-6 lg:flex-row">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex w-full flex-col gap-4 lg:w-2/3"
				>
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
									className="border border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white md:ml-auto"
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
									<Plus />
									Vehículo
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
													className="border border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white md:ml-auto"
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
								onClick={() =>
									appendSupervisor({ name: "", email: "", rut: "", isSupervisor: true })
								}
								className="border border-green-500 bg-green-600/10 text-green-500 hover:bg-green-500 hover:text-white"
							>
								<Plus />
								Agregar Supervisor
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
											className="border border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white md:ml-auto"
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
						className="hover:bg-primary/80"
						label={`Crear empresa${needAddVehicle ? " y vehículo(s)" : ""}`}
					/>
				</form>
			</Form>

			<Card className="h-fit w-full lg:w-1/3">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center space-y-4">
						<div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
							<BuildingIcon className="text-muted-foreground h-16 w-16" />
						</div>

						<div className="space-y-2 text-center">
							<h3 className="text-xl font-semibold">{formValues.name || "Nombre de la Empresa"}</h3>
							<p className="text-muted-foreground text-sm">{formValues.rut || "XX.XXX.XXX-X"}</p>
						</div>

						<div className="w-full space-y-4 pt-4">
							{formValues.vehicles && formValues.vehicles?.length > 0 && (
								<div className="divide-y">
									<div className="flex justify-between py-1 text-sm">
										<span className="text-muted-foreground font-semibold">Vehículos:</span>
										<span>{formValues.vehicles?.length || 0}</span>
									</div>

									{formValues.vehicles?.map((vehicle, index) => (
										<div key={index} className="space-y-1 py-2">
											<div key={index} className="flex justify-between text-sm">
												<span className="text-muted-foreground">Marca:</span>
												<span>{vehicle.brand || "Marca"}</span>
											</div>
											<div key={index} className="flex justify-between text-sm">
												<span className="text-muted-foreground">Modelo:</span>
												<span>{vehicle.model || "Modelo"}</span>
											</div>
											<div key={index} className="flex justify-between text-sm">
												<span className="text-muted-foreground">Año:</span>
												<span>{vehicle.year || "Año"}</span>
											</div>
											<div key={index} className="flex justify-between text-sm">
												<span className="text-muted-foreground">Patente:</span>
												<span>{vehicle.plate || "Patente"}</span>
											</div>
										</div>
									))}
								</div>
							)}

							{formValues.supervisors && formValues.supervisors?.length > 0 && (
								<div className="space-y-1 divide-y">
									<div className="flex justify-between py-1 text-sm">
										<span className="text-muted-foreground font-semibold">Supervisores:</span>
										<span>{formValues.supervisors?.length || 0}</span>
									</div>

									{formValues.supervisors?.map((supervisor, index) => (
										<div key={index} className="space-y-1 py-2">
											<div key={index} className="flex justify-between text-sm">
												<span className="text-muted-foreground">Nombre:</span>
												<span>{supervisor.name || "Nombre del Supervisor"}</span>
											</div>
											<div key={index} className="flex justify-between text-sm">
												<span className="text-muted-foreground">Email:</span>
												<span>{supervisor.email || "correo@ejemplo.com"}</span>
											</div>
											<div key={index} className="flex justify-between text-sm">
												<span className="text-muted-foreground">RUT:</span>
												<span>{supervisor.rut || "XX.XXX.XXX-X"}</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
