"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createEquipment } from "@/actions/equipments/createEquipment"
import {
	equipmentSchema,
	type EquipmentSchema,
} from "@/lib/form-schemas/admin/equipment/equipment.schema"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
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

interface CreateEquipmentFormProps {
	parentId?: string
}

export default function CreateEquipmentForm({
	parentId,
}: CreateEquipmentFormProps): React.ReactElement {
	const [loading, setLoading] = useState(false)

	const router = useRouter()

	const form = useForm<EquipmentSchema>({
		resolver: zodResolver(equipmentSchema),
		defaultValues: {
			name: "",
			tag: "",
			type: "",
			location: "",
			description: "",
			parentId: parentId,
			isOperational: true,
		},
	})

	async function onSubmit(values: EquipmentSchema) {
		setLoading(true)

		try {
			const { ok, message } = await createEquipment({ values })

			if (!ok) {
				toast("Error al crear el equipo", {
					description: message,
					duration: 5000,
				})
				return
			}

			toast("Equipo creado exitosamente", {
				duration: 3000,
			})

			router.push("/admin/dashboard/equipos")
		} catch (error) {
			console.log(error)
			toast("Error al crear el equipo", {
				description: "Ocurrió un error al intentar crear el equipo",
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
							name="tag"
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel className="text-gray-700">TAG</FormLabel>
										<FormControl>
											<Input
												className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
												placeholder="TAG"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
						/>

						<FormField
							control={form.control}
							name="location"
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel className="text-gray-700">Ubicación</FormLabel>
										<FormControl>
											<Input
												className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
												placeholder="Ubicación"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
						/>

						<FormField
							control={form.control}
							name="type"
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel className="text-gray-700">Tipo de equipo</FormLabel>
										<FormControl>
											<Input
												className="w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
												placeholder="Tipo de equipo"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => {
								return (
									<FormItem className="md:col-span-2">
										<FormLabel className="text-gray-700">Descripción</FormLabel>
										<FormControl>
											<Textarea
												className="h-24 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700"
												placeholder="Descripción"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
						/>

						<FormField
							control={form.control}
							name="isOperational"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center gap-2">
									<FormControl>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>¿Esta operativo?</FormLabel>
									</div>
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

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
						"Crear Equipo"
					)}
				</Button>
			</form>
		</Form>
	)
}
