"use client"

import { Car, IdCard, PlusCircleIcon, PlusIcon, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { companySchema, type CompanySchema } from "@/lib/form-schemas/admin/company/company.schema"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { sendNewUserEmail } from "@/actions/emails/sendRequestEmail"
import { createCompany } from "@/actions/companies/createCompany"
import { VehicleTypeOptions } from "@/lib/consts/vehicle-type"
import { USER_ROLES_VALUES } from "@/lib/consts/user-roles"
import { authClient } from "@/lib/auth-client"

import { ColorPickerFormField } from "@/components/forms/shared/ColorPickerFormField"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SelectFormField } from "@/components/forms/shared/SelectFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { RutFormField } from "@/components/forms/shared/RutFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

import type { User } from "@prisma/client"

export default function CreateCompanyFormSheet(): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const router = useRouter()

	const form = useForm<CompanySchema>({
		resolver: zodResolver(companySchema),
		defaultValues: {
			rut: "",
			name: "",
			vehicles: [],
			supervisors: [],
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

	async function onSubmit(values: CompanySchema) {
		setLoading(true)

		try {
			const { ok, message, data } = await createCompany({ values })

			if (!ok || !data) {
				toast.error("Error al crear la empresa", {
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
					toast.error("Error al crear algunos usuarios", {
						description: `${successes.length} usuarios creados exitosamente. ${errors.length} usuarios fallaron.`,
						duration: 5000,
					})
					return
				}
			}

			toast.success("Empresa creada exitosamente", {
				description: "La empresa ha sido creada exitosamente",
				duration: 3000,
			})

			router.push("/admin/dashboard/empresas")
		} catch (error) {
			console.log(error)
			toast.error("Error al crear la empresa", {
				description: "Ocurrió un error al intentar crear la empresa",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger className="bg-primary text-white h-10 rounded-md px-3 text-sm flex items-center justify-center gap-1 hover:bg-primary/80" onClick={() => setOpen(true)}>
				<PlusIcon className="h-4 w-4" />
				<span className="hidden sm:inline">Nueva Empresa</span>
			</SheetTrigger>

			<SheetContent className="sm:max-w-md gap-0">
				<SheetHeader className="shadow">
					<SheetTitle>
						Nueva Empresa
					</SheetTitle>
					<SheetDescription>
						Complete los campos para crear una nueva empresa, en el caso de agregar un supervisor le enviará un correo con su contraseña temporal para que pueda iniciar sesión.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex w-full flex-col pt-4 gap-4 overflow-y-scroll pb-16 px-4"
					>
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

						<Separator className="my-2" />

						<div>

							<h3 className="text-sm font-semibold">
								Vehículos y Supervisores
							</h3>
							<p className="text-sm text-muted-foreground">
								Puedes agregar vehículos y supervisores para la empresa. De igual manera podrás agregarlos más tarde.
							</p>
						</div>

						<Tabs defaultValue="vehicles" className="w-full mt-1">
							<TabsList className="w-full rounded-sm">
								<TabsTrigger className="rounded-sm" value="vehicles">Vehículos</TabsTrigger>
								<TabsTrigger className="rounded-sm" value="supervisors">Supervisores</TabsTrigger>
							</TabsList>

							<TabsContent value="vehicles" className="w-full flex flex-col gap-y-4 pt-2 space-y-4">
								{vehiclesFields.map((field, index) => (
									<div className="grid gap-y-4 gap-x-2 sm:grid-cols-2" key={field.id}>
										<div className="flex items-center justify-between sm:col-span-2">
											<h3 className="text-sm  font-semibold flex items-center gap-1">
												<Car className="h-4.5 w-4.5" />
												Vehículo {index === 0 ? "Principal" : index + 1}
											</h3>

											<Button
												type="button"
												size={'icon'}
												className="shadow-none bg-transparent hover:text-red-500 text-text"
												onClick={() => removeVehicle(index)}
											>
												<Trash2 />
											</Button>
										</div>

										<InputFormField<CompanySchema>
											min={2000}
											label="Año"
											type="number"
											placeholder="Año"
											control={form.control}
											max={new Date().getFullYear()}
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

										<SelectFormField<CompanySchema>
											label="Tipo"
											control={form.control}
											name={`vehicles.${index}.type`}
											options={VehicleTypeOptions}
										/>
									</div>
								))}

								<Button
									type="button"
									className="bg-transparent hover:underline shadow-none text-primary w-fit"
									onClick={() =>
										appendVehicle({
											plate: "",
											brand: "",
											model: "",
											color: "",
											type: "CAR",
											year: "2000",
											isMain: false,
										})
									}
								>
									<PlusCircleIcon className="h-3 w-3" />
									Añadir Vehículo
								</Button>
							</TabsContent>

							<TabsContent value="supervisors" className="w-full flex flex-col gap-y-4 pt-2 space-y-4">
								{supervisorsFields.map((field, index) => (
									<div
										key={field.id}
										className="grid gap-y-4 gap-x-2 sm:grid-cols-2"
									>
										<div className="flex items-center justify-between sm:col-span-2">
											<h4 className="text-sm font-medium flex items-center gap-1">
												<IdCard className="h-4.5 w-4.5" />
												Datos del Supervisor {index + 1}
											</h4>

											<Button
												type="button"
												className="w-fit bg-transparent hover:text-red-500 text-text shadow-none"
												onClick={() => removeSupervisor(index)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>

										<InputFormField<CompanySchema>
											name={`supervisors.${index}.name`}
											label="Nombre"
											control={form.control}
											placeholder="Nombre del supervisor"
										/>

										<RutFormField<CompanySchema>
											name={`supervisors.${index}.rut`}
											label="RUT"
											control={form.control}
											placeholder="RUT del supervisor"
										/>

										<InputFormField<CompanySchema>
											name={`supervisors.${index}.email`}
											label="Email"
											control={form.control}
											placeholder="Email del supervisor"
											itemClassName="sm:col-span-2"
										/>
									</div>
								))}

								<Button
									type="button"
									onClick={() =>
										appendSupervisor({ name: "", email: "", rut: "", isSupervisor: true })
									}
									className="bg-transparent hover:underline shadow-none text-primary w-fit"
								>
									<PlusCircleIcon className="h-4 w-4" />
									Añadir Supervisor
								</Button>
							</TabsContent>
						</Tabs>

						<Separator className="my-2" />

						<SubmitButton
							label="Crear empresa"
							isSubmitting={loading}
							className="hover:bg-primary/80 hover:text-white"
						/>
					</form>
				</Form>
			</SheetContent >
		</Sheet >
	)
}
