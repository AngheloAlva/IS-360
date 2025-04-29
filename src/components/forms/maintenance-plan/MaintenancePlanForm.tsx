"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { createMaintenancePlan } from "@/actions/maintenance-plan-task/createMaintenancePlan"
import { PlanLocationOptions } from "@/lib/consts/plan-location"
import { useEquipments } from "@/hooks/use-equipments"
import {
	maintenancePlanSchema,
	type MaintenancePlanSchema,
} from "@/lib/form-schemas/maintenance-plan/maintenance-plan.schema"

import { TextAreaFormField } from "../shared/TextAreaFormField"
import { SelectFormField } from "../shared/SelectFormField"
import { InputFormField } from "../shared/InputFormField"
import { Skeleton } from "@/components/ui/skeleton"
import SubmitButton from "../shared/SubmitButton"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select"
import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormMessage,
	FormControl,
} from "@/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

interface MaintenancePlanFormProps {
	userId: string
}

export default function MaintenancePlanForm({
	userId,
}: MaintenancePlanFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const router = useRouter()

	const form = useForm<MaintenancePlanSchema>({
		resolver: zodResolver(maintenancePlanSchema),
		defaultValues: {
			name: "",
			description: "",
			createdById: userId,
			location: undefined,
			equipmentId: undefined,
		},
	})

	const { data: equipments, isLoading: isEquipmentsLoading } = useEquipments({ limit: 1000 })

	const onSubmit = async (values: MaintenancePlanSchema) => {
		setIsSubmitting(true)
		try {
			const { ok, message, code } = await createMaintenancePlan({ values })

			if (ok) {
				toast.success("Plan de mantenimiento creado exitosamente", {
					description: "El plan de mantenimiento ha sido creado exitosamente",
					duration: 3000,
				})
				setOpen(false)
				router.refresh()
				form.reset()
			} else {
				if (code === "NAME_ALREADY_EXISTS") {
					toast.error("El nombre del plan de mantenimiento ya existe", {
						description: "Por favor, elige un nombre único para el plan de mantenimiento",
						duration: 5000,
						className: "bg-red-500/10 border border-red-500 text-white",
					})
				} else {
					toast.error("Error al crear el plan de mantenimiento", {
						description: message,
						duration: 5000,
					})
				}
			}
		} catch (error) {
			console.log(error)
			toast.error("Error al crear el plan de mantenimiento", {
				description: "Ocurrió un error al intentar crear el plan de mantenimiento",
				duration: 5000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button size={"lg"} className="bg-primary hover:bg-primary/80 text-white">
					<Plus />
					Plan
					<span className="hidden sm:inline"> de Mantenimiento</span>
				</Button>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Crear Plan de Mantenimiento</SheetTitle>
					<SheetDescription>
						Complete el formulario para crear un nuevo plan de mantenimiento.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-2 gap-y-5 px-4 pt-4 sm:grid-cols-2"
					>
						<InputFormField<MaintenancePlanSchema>
							name="name"
							label="Nombre"
							control={form.control}
							placeholder="Nombre del plan de mantenimiento"
							className="sm:col-span-2"
						/>

						<SelectFormField<MaintenancePlanSchema>
							name="location"
							label="Ubicación"
							control={form.control}
							options={PlanLocationOptions}
							placeholder="Selecciona la ubicación"
						/>

						<FormField
							control={form.control}
							name="equipmentId"
							render={({ field }) => (
								<FormItem className="sm:col-span-2">
									<FormLabel>Equipo</FormLabel>
									{isEquipmentsLoading ? (
										<FormControl>
											<Skeleton className="h-10 w-full" />
										</FormControl>
									) : (
										<Select
											disabled={!equipments}
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona el equipo" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-w-[var(--radix-select-trigger-width)]">
												{equipments?.equipments?.map((equipment) => (
													<SelectItem key={equipment.id} value={equipment.id}>
														{equipment.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>

						<TextAreaFormField<MaintenancePlanSchema>
							name="description"
							label={`Descripción`}
							control={form.control}
							itemClassName="sm:col-span-2"
							placeholder="Descripción del plan de mantenimiento"
						/>

						<SubmitButton
							label="Crear Plan de Mantenimiento"
							isSubmitting={isSubmitting}
							className="hover:bg-primary/80 sm:col-span-2"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
