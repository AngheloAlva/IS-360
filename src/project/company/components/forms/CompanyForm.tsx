"use client"

import { Car, IdCard, PlusCircleIcon, PlusIcon, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"

import { companySchema, type CompanySchema } from "@/project/company/schemas/company.schema"
import { sendNewUserEmail } from "@/project/user/actions/sendNewUserEmail"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { createCompany } from "@/project/company/actions/createCompany"
import { VehicleTypeOptions } from "@/lib/consts/vehicle-type"
import { queryClient } from "@/lib/queryClient"
import { authClient } from "@/lib/auth-client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { ColorPickerFormField } from "@/shared/components/forms/ColorPickerFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { RutFormField } from "@/shared/components/forms/RutFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

import { StartupFolderType, type User } from "@prisma/client"

export default function CompanyForm(): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<CompanySchema>({
		resolver: zodResolver(companySchema),
		defaultValues: {
			rut: "",
			name: "",
			vehicles: [],
			supervisors: [],
			startupFolderName: "",
			startupFolderType: StartupFolderType.FULL,
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
							role: ["partnerCompany"],
							data: {
								companyId: data.id,
								rut: supervisor.rut,
								phone: supervisor.phone,
								internalArea: supervisor.internalArea,
								internalRole: supervisor.internalRole,
								isSupervisor: supervisor.isSupervisor,
							},
						})

						if (error)
							throw new Error(`Error al crear usuario ${supervisor.name}: ${error.message}`)

						await authClient.admin.setRole({
							userId: newUser.user.id,
							role: ["partnerCompany"],
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
					(
						result
					): result is PromiseFulfilledResult<{ user: User & { role: string | undefined } }> =>
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

			queryClient.invalidateQueries({
				queryKey: ["companies"],
			})

			setOpen(false)
			form.reset()
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
			<SheetTrigger
				className="text-primary flex h-10 items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-medium transition-all hover:scale-105"
				onClick={() => setOpen(true)}
			>
				<PlusIcon className="h-4 w-4" />
				<span className="hidden md:inline">Nueva Empresa</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader className="shadow">
					<SheetTitle>Nueva Empresa</SheetTitle>
					<SheetDescription>
						Complete los campos para crear una nueva empresa, en el caso de agregar un supervisor le
						enviará un correo con su contraseña temporal para que pueda iniciar sesión.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex w-full flex-col gap-4 overflow-y-scroll px-4 pt-4 pb-16"
					>
						<InputFormField<CompanySchema>
							name="name"
							control={form.control}
							label="Nombre empresa"
							placeholder="Nombre de la empresa"
						/>

						<RutFormField<CompanySchema>
							name="rut"
							label="RUT empresa"
							control={form.control}
							placeholder="RUT de la empresa"
						/>

						<SelectFormField<CompanySchema>
							name="startupFolderType"
							control={form.control}
							label="Tipo de carpeta de arranque"
							placeholder="Tipo de carpeta de arranque"
							options={[
								{ value: StartupFolderType.FULL, label: "Carpeta de arranque" },
								{ value: StartupFolderType.BASIC, label: "Documentos basicos" },
							]}
						/>

						<InputFormField<CompanySchema>
							name="startupFolderName"
							control={form.control}
							label="Nombre de la carpeta de arranque"
							placeholder="Nombre de la carpeta de arranque"
							description="Este nombre se usará para crear la primera carpeta de arranque de la empresa"
						/>

						<Separator className="my-2" />

						<div>
							<h3 className="text-sm font-semibold">Vehículos y Supervisores</h3>
							<p className="text-muted-foreground text-sm">
								Puedes agregar vehículos y supervisores para la empresa. De igual manera podrás
								agregarlos más tarde.
							</p>
						</div>

						<Tabs defaultValue="supervisors" className="mt-1 w-full">
							<TabsList className="w-full rounded-sm">
								<TabsTrigger className="rounded-sm" value="supervisors">
									Supervisores
								</TabsTrigger>
								<TabsTrigger className="rounded-sm" value="vehicles">
									Vehículos
								</TabsTrigger>
							</TabsList>
							<TabsContent
								value="supervisors"
								className="flex w-full flex-col space-y-4 gap-y-4 pt-2"
							>
								{supervisorsFields.map((field, index) => (
									<div key={field.id} className="grid gap-x-2 gap-y-4 sm:grid-cols-2">
										<div className="flex items-center justify-between sm:col-span-2">
											<h4 className="flex items-center gap-1 text-sm font-medium">
												<IdCard className="h-4.5 w-4.5" />
												Datos del Supervisor {index + 1}
											</h4>

											<Button
												type="button"
												className="text-text w-fit bg-transparent shadow-none hover:text-red-500"
												onClick={() => removeSupervisor(index)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>

										<InputFormField<CompanySchema>
											name={`supervisors.${index}.name`}
											control={form.control}
											label="Nombre completo"
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

										<InputFormField<CompanySchema>
											name={`supervisors.${index}.phone`}
											label="Telefono"
											control={form.control}
											placeholder="Telefono del supervisor"
											itemClassName="sm:col-span-2"
										/>

										<InputFormField<CompanySchema>
											name={`supervisors.${index}.internalArea`}
											label="Area interna"
											control={form.control}
											itemClassName="sm:col-span-2"
											placeholder="Area interna del supervisor"
										/>

										<InputFormField<CompanySchema>
											name={`supervisors.${index}.internalRole`}
											label="Cargo"
											control={form.control}
											itemClassName="sm:col-span-2"
											placeholder="Cargo del supervisor"
										/>
									</div>
								))}

								<Button
									type="button"
									onClick={() =>
										appendSupervisor({
											rut: "",
											name: "",
											email: "",
											phone: "",
											internalArea: "",
											internalRole: "",
											isSupervisor: true,
										})
									}
									className="text-primary w-fit bg-transparent shadow-none hover:underline"
								>
									<PlusCircleIcon className="h-4 w-4" />
									Añadir Supervisor
								</Button>
							</TabsContent>

							<TabsContent value="vehicles" className="flex w-full flex-col space-y-4 gap-y-4 pt-2">
								{vehiclesFields.map((field, index) => (
									<div className="grid gap-x-2 gap-y-4 sm:grid-cols-2" key={field.id}>
										<div className="flex items-center justify-between sm:col-span-2">
											<h3 className="flex items-center gap-1 text-sm font-semibold">
												<Car className="h-4.5 w-4.5" />
												Vehículo {index === 0 ? "Principal" : index + 1}
											</h3>

											<Button
												type="button"
												size={"icon"}
												className="text-text bg-transparent shadow-none hover:text-red-500"
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
									className="text-primary w-fit bg-transparent shadow-none hover:underline"
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
						</Tabs>

						<Separator className="my-4" />

						<div className="flex w-full items-center justify-center gap-2">
							<Button
								size="lg"
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								className="w-1/2 border-2 border-indigo-600 font-medium tracking-wider text-indigo-600 transition-all hover:scale-105 hover:bg-indigo-600 hover:text-white"
							>
								Cancelar
							</Button>

							<SubmitButton
								label="Crear empresa"
								isSubmitting={loading}
								className="w-1/2 bg-blue-600 hover:bg-blue-700"
							/>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
