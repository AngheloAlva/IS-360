"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { updateUser } from "@/actions/users/updateUser"
import { formatRut } from "@/utils/formatRut"
import {
	externalUserSchema,
	type ExternalUserSchema,
} from "@/lib/form-schemas/admin/user/externalUser.schema"

import { Checkbox } from "@/components/ui/checkbox"
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

import type { User } from "@prisma/client"

interface ExternalUserFormProps {
	user: User
}

export default function ExternalUserForm({ user }: ExternalUserFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<ExternalUserSchema>({
		resolver: zodResolver(externalUserSchema),
		defaultValues: {
			rut: user.rut,
			name: user.name,
			email: user.email,
			isSupervisor: user.isSupervisor ?? false,
		},
	})

	async function onSubmit(values: ExternalUserSchema) {
		setLoading(true)

		try {
			const { ok, data } = await updateUser({ userId: user.id, values })

			if (ok) {
				toast("Usuario actualizado exitosamente", {
					description: `El usuario ${data?.name} ha sido actualizado exitosamente`,
					duration: 3000,
				})
				router.push("/dashboard/admin/usuarios")
			} else {
				toast("Error al actualizar el usuario", {
					description: "Ocurrió un error al intentar actualizar el usuario",
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)
			toast("Error al actualizar el usuario", {
				description: "Ocurrió un error al intentar actualizar el usuario",
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
					name={`name`}
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
					name={`email`}
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
					name={`rut`}
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
					name={`isSupervisor`}
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
						"Actualizar usuario"
					)}
				</Button>
			</form>
		</Form>
	)
}
