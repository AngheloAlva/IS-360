"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { getCompanies } from "@/actions/companies/getCompanies"
import { USER_ROLES } from "@/lib/consts/user-roles"
import { authClient } from "@/lib/auth-client"
import { formatRut } from "@/utils/formatRut"
import { cn } from "@/lib/utils"
import {
	externalUsersSchema,
	type ExternalUsersSchema,
} from "@/lib/form-schemas/admin/user/externalUsers.schema"

import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select"

import type { Company, User } from "@prisma/client"

type CompanyWithUser = Company & {
	users: User[]
}

export default function ExternalUsersForm(): React.ReactElement {
	const [loading, setLoading] = useState(false)
	const [companies, setCompanies] = useState<CompanyWithUser[]>([])
	const [isCompaniesLoading, setIsCompaniesLoading] = useState(false)
	const [hasSupervisor, setHasSupervisor] = useState<User | null>(null)
	const [selectedCompany, setSelectedCompany] = useState<CompanyWithUser | null>(null)

	const router = useRouter()

	const form = useForm<ExternalUsersSchema>({
		resolver: zodResolver(externalUsersSchema),
		defaultValues: {
			employees: [
				{
					rut: "",
					name: "",
					email: "",
					isSupervisor: false,
				},
			],
		},
	})

	useEffect(() => {
		const fetchCompanies = async () => {
			setIsCompaniesLoading(true)
			const { data, ok } = await getCompanies(100, 1)

			if (!ok || !data) {
				toast("Error al cargar las empresas", {
					description: "Ocurrió un error al intentar cargar las empresas",
					duration: 5000,
				})
				return
			}

			if (data && data.length > 0) {
				setCompanies(data)
			}

			setIsCompaniesLoading(false)
		}

		fetchCompanies()
	}, [])

	useEffect(() => {
		const company = companies.find((company) => company.id === form.watch("companyId"))

		if (company) {
			setSelectedCompany(company)
		}

		if (company?.users && company.users.length > 0) {
			setHasSupervisor(company.users[0])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.watch("companyId")])

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "employees",
	})

	async function onSubmit(values: ExternalUsersSchema) {
		setLoading(true)

		try {
			const results = await Promise.allSettled(
				values.employees.map(async (employee) => {
					const temporalPassword = generateTemporalPassword()

					const { data: newUser, error } = await authClient.admin.createUser({
						email: employee.email,
						role: USER_ROLES.PARTNER_COMPANY,
						password: temporalPassword,
						name: employee.name,
						data: {
							rut: employee.rut,
							companyId: selectedCompany?.id,
						},
					})

					if (error) throw new Error(`Error al crear usuario ${employee.name}: ${error.message}`)
					return newUser
				})
			)

			const errors = results.filter(
				(result): result is PromiseRejectedResult => result.status === "rejected"
			)
			const successes = results.filter(
				(result): result is PromiseFulfilledResult<{ user: User }> => result.status === "fulfilled"
			)

			if (errors.length > 0) {
				toast("Error al crear algunos usuarios", {
					description: `${successes.length} usuarios creados exitosamente. ${errors.length} usuarios fallaron.`,
					duration: 5000,
				})
			} else {
				toast("Usuarios creados exitosamente", {
					description: `${successes.length} usuarios han sido creados exitosamente`,
					duration: 3000,
				})
				router.push("/dashboard/admin/usuarios")
			}
		} catch (error) {
			console.error(error)
			toast("Error al crear usuarios", {
				description: "Ocurrió un error al intentar crear los usuarios",
				duration: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid w-full max-w-screen-lg gap-3 md:grid-cols-2"
			>
				<div className="md:col-span-2">
					<FormField
						control={form.control}
						name="companyId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Empresa</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger className="border-gray-200">
											<SelectValue placeholder="Seleccione una empresa" />
										</SelectTrigger>
									</FormControl>
									<SelectContent className="text-neutral-700">
										{isCompaniesLoading ? (
											<Skeleton className="h-8 w-full" />
										) : (
											companies.map((company) => (
												<SelectItem key={company.id} value={company.id}>
													{company.name}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					{selectedCompany && (
						<div className="mt-3 flex flex-col text-sm">
							<h2 className="font-medium">Empresa Seleccionada:</h2>
							<p>{selectedCompany.name}</p>
							<p className="text-muted-foreground">{selectedCompany.rut}</p>

							{hasSupervisor && (
								<>
									<h3 className="font-medium">Supervisor:</h3>
									<p className="text-muted-foreground">{hasSupervisor.name}</p>
								</>
							)}
						</div>
					)}
				</div>

				<Separator className="my-4 md:col-span-2" />

				<div className="flex items-center justify-between md:col-span-2">
					<h3 className="font-medium underline">Empleado(s)</h3>

					<Button
						type="button"
						onClick={() => append({ name: "", email: "", rut: "" })}
						className="bg-feature hover:bg-feature/80"
					>
						Agregar Empleado <Plus className="ml-2" />
					</Button>
				</div>

				{fields.map((field, index) => (
					<div
						className={cn("mt-2 grid gap-3 md:col-span-2 md:grid-cols-2", {
							"mt-6": index >= 1,
						})}
						key={field.id}
					>
						<div className="flex items-center justify-between md:col-span-2">
							<h4 className="font-medium">Datos del Empleado {index + 1}</h4>

							<Button type="button" variant={"outline"} onClick={() => remove(index)}>
								Eliminar #{index + 1}
							</Button>
						</div>

						<FormField
							control={form.control}
							name={`employees.${index}.name`}
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
							name={`employees.${index}.email`}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-700">Email</FormLabel>
									<FormControl>
										<Input
											className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
											placeholder="Email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name={`employees.${index}.rut`}
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

						<FormField
							control={form.control}
							name={`employees.${index}.isSupervisor`}
							render={({ field }) => (
								<FormItem className="flex h-9 flex-row items-center justify-start rounded-md border border-gray-200 px-3 shadow-xs md:mt-5.5">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											className="border-gray-200"
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Es Supervisor?</FormLabel>
									</div>
								</FormItem>
							)}
						/>
					</div>
				))}

				<Separator className="my-4 md:col-span-2" />

				<Button className="mt-4 md:col-span-2" type="submit" disabled={loading}>
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
						"Crear usuario(s)"
					)}
				</Button>
			</form>
		</Form>
	)
}
