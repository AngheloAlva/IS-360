"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { userSchema, type UserSchema } from "@/lib/form-schemas/admin/user/user.schema"
import { InternalRoleOptions } from "@/lib/consts/internal-roles"
import { UserRoleOptions } from "@/lib/consts/user-roles"
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
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select"
import { authClient } from "@/lib/auth-client"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"

export default function UserForm(): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<UserSchema>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			rut: "",
			name: "",
			email: "",
			role: "USER",
			internalRole: "NONE",
			area: null,
		},
	})

	async function onSubmit(values: UserSchema) {
		setLoading(true)

		try {
			const temporalPassword = generateTemporalPassword()

			const { data: newUser, error } = await authClient.admin.createUser({
				email: values.email,
				password: temporalPassword,
				name: values.name,
				role: values.role,
				data: {
					rut: values.rut,
					role: values.role,
					internalRole: values.role === "PARTNER_COMPANY" ? "NONE" : values.internalRole,
					area: values.role === "PARTNER_COMPANY" ? null : values.area,
				},
			})

			if (error) {
				toast("Error al crear el usuario", {
					description:
						"Por favor, verifique que los datos ingresados sean correctos y que el email o RUT no estén duplicados",
					duration: 5000,
				})
				return
			}

			if (newUser) {
				toast("Usuario creado exitosamente", {
					description: "El usuario ha sido creado exitosamente",
					duration: 3000,
				})

				router.push("/dashboard/admin/usuarios")
			}
		} catch (error) {
			console.log(error)
			toast("Error al crear el usuario", {
				description: "Ocurrió un error al intentar crear el usuario",
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
					name="email"
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

				<FormField
					control={form.control}
					name="role"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Rol</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="border-gray-200">
										<SelectValue placeholder="Seleccione un rol" />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="text-neutral-700">
									{UserRoleOptions.map((role) => (
										<SelectItem key={role.value} value={role.value}>
											{role.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{form.watch("role") !== "PARTNER_COMPANY" && (
					<>
						<FormField
							control={form.control}
							name="internalRole"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rol Interno</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger className="border-gray-200">
												<SelectValue placeholder="Seleccione un rol interno" />
											</SelectTrigger>
										</FormControl>
										<SelectContent className="text-neutral-700">
											{InternalRoleOptions.map((role) => (
												<SelectItem key={role.value} value={role.value}>
													{role.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="area"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Área</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value || ""}>
										<FormControl>
											<SelectTrigger className="border-gray-200">
												<SelectValue placeholder="Seleccione un área" />
											</SelectTrigger>
										</FormControl>
										<SelectContent className="text-neutral-700">
											<SelectItem value="OPERATIONS">Operaciones</SelectItem>
											<SelectItem value="INSTRUCTIONS">Instructivos</SelectItem>
											<SelectItem value="INTEGRITY_AND_MAINTENANCE">
												Integridad y Mantención
											</SelectItem>
											<SelectItem value="ENVIRONMENT">Medio Ambiente</SelectItem>
											<SelectItem value="RISK_PREVENTION">Prevención de Riesgos</SelectItem>
											<SelectItem value="QUALITY_AND_PROFESSIONAL_EXCELLENCE">
												Calidad y Excelencia Profesional
											</SelectItem>
											<SelectItem value="HSEQ">HSEQ</SelectItem>
											<SelectItem value="LEGAL">Jurídica</SelectItem>
											<SelectItem value="COMMUNITIES">Comunidades</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}

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
						"Crear usuario"
					)}
				</Button>
			</form>
		</Form>
	)
}
