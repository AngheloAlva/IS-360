"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { companySchema, type CompanySchema } from "@/lib/form-schemas/admin/company/company.schema"
import { createCompany } from "@/actions/companies/createCompany"
import { formatRut } from "@/utils/formatRut"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function UserForm(): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<CompanySchema>({
		resolver: zodResolver(companySchema),
		defaultValues: {
			rut: "",
			name: "",
			vehicles: [],
			addVehicle: false,
		},
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "vehicles",
	})

	const needAddVehicle = form.watch("addVehicle")

	async function onSubmit(values: CompanySchema) {
		setLoading(true)

		try {
			const { ok, message } = await createCompany({ values })

			if (!ok) {
				toast("Error al crear la empresa", {
					description: message,
					duration: 5000,
				})
				return
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
					<CardContent className="grid gap-3 md:grid-cols-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">Nombre</FormLabel>
									<FormControl>
										<Input
											className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="Nombre"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="rut"
							render={({ field }) => {
								// eslint-disable-next-line @typescript-eslint/no-unused-vars
								const { onChange, ...restFieldProps } = field

								return (
									<FormItem>
										<FormLabel className="text-gray-700">RUT</FormLabel>
										<FormControl>
											<Input
												className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
												onChange={(e) => {
													field.onChange(formatRut(e.target.value))
												}}
												placeholder="RUT"
												{...restFieldProps}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
						/>
					</CardContent>
				</Card>

				<Card className="w-full">
					<CardContent className="grid gap-3 md:grid-cols-2">
						<FormField
							control={form.control}
							name="addVehicle"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center gap-2">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={() => {
												field.onChange(!field.value)

												if (!field.value) {
													append({
														year: "",
														plate: "",
														brand: "",
														model: "",
														color: "",
														type: "CAR",
														isMain: true,
													})
												} else {
													remove()
												}
											}}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Agregar vehículos</FormLabel>
									</div>
								</FormItem>
							)}
						/>

						{needAddVehicle && (
							<Button
								type="button"
								className="border-primary text-primary border bg-white hover:text-white md:ml-auto"
								onClick={() =>
									append({
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
					fields.map((field, index) => (
						<Card key={field.id}>
							<CardContent>
								<div className="grid gap-3 md:col-span-2 md:grid-cols-2">
									<div className="flex items-center justify-between md:col-span-2">
										<CardTitle className="text-gray-700">
											Vehículo {index === 0 ? "Principal" : index + 1}
										</CardTitle>

										{index !== 0 && (
											<Button
												type="button"
												className="border border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white md:ml-auto"
												onClick={() => remove(index)}
											>
												Eliminar #{index + 1}
											</Button>
										)}
									</div>

									<FormField
										name={`vehicles.${index}.year`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-700">Año</FormLabel>
												<FormControl>
													<Input
														type="number"
														className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
														placeholder="Año"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name={`vehicles.${index}.plate`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-700">Patente</FormLabel>
												<FormControl>
													<Input
														className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
														placeholder="Patente"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name={`vehicles.${index}.brand`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-700">Marca</FormLabel>
												<FormControl>
													<Input
														className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
														placeholder="Marca"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name={`vehicles.${index}.model`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-700">Modelo</FormLabel>
												<FormControl>
													<Input
														className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
														placeholder="Modelo"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name={`vehicles.${index}.color`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-700">Color</FormLabel>
												<FormControl>
													<Input
														type="color"
														className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
														placeholder="Color"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>
					))}

				<Button className="mt-4 w-full" size={"lg"} type="submit" disabled={loading}>
					{loading ? (
						<div role="status" className="flex items-center justify-center">
							<svg
								aria-hidden="true"
								className="fill-primary h-8 w-8 animate-spin text-gray-200 dark:text-gray-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
							<span className="sr-only">Cargando...</span>
						</div>
					) : (
						"Crear empresa" + (needAddVehicle ? " y vehículo(s)" : "")
					)}
				</Button>
			</form>
		</Form>
	)
}
