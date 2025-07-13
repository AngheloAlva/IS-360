"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { PlusCircleIcon, UserIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { addYears } from "date-fns"
import { toast } from "sonner"

import { registerIrlSafetyTalk } from "@/project/safety-talk/actions/register-irl-safety-talk"
import { useCompanyEmployees } from "@/project/safety-talk/hooks/use-company-employees"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { cn } from "@/lib/utils"
import {
	irlSafetyTalkSchema,
	type IrlSafetyTalkSchema,
} from "@/project/safety-talk/schemas/irl-safety-talk.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

export function IrlSafetyTalkForm() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const form = useForm<IrlSafetyTalkSchema>({
		resolver: zodResolver(irlSafetyTalkSchema),
		defaultValues: {
			companyId: "",
			employees: [],
		},
	})

	const { data: companies, isLoading: isLoadingCompanies } = useCompanies({
		limit: 500,
	})

	const selectedCompanyId = form.watch("companyId")
	const { employees } = useCompanyEmployees({
		companyId: selectedCompanyId,
	})

	useEffect(() => {
		if (employees) {
			form.setValue(
				"employees",
				employees.map((employee) => ({
					name: employee.name,
					userId: employee.id,
					talksId: employee.safetyTalks[0].id,
					score: employee.safetyTalks[0].score.toString(),
					approved: employee.safetyTalks[0].status === "PASSED",
					expiresAt: employee.safetyTalks[0].expiresAt || addYears(new Date(), 1),
					sessionDate: employee.safetyTalks[0].inPersonSessionDate || new Date(),
				}))
			)
		}
	}, [employees, form])

	const { fields } = useFieldArray({
		name: "employees",

		control: form.control,
	})

	const onSubmit = async (data: IrlSafetyTalkSchema) => {
		try {
			setIsSubmitting(true)

			const result = await registerIrlSafetyTalk(data)

			if (result.ok) {
				toast.success(result.message)
				form.reset({
					companyId: "",
					employees: [],
				})
				setOpen(false)
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al registrar las charlas de seguridad")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className={cn(
					"flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-medium text-emerald-600 transition-all hover:scale-105"
				)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				Registrar Charla IRL
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-3xl">
				<SheetHeader className="shadow">
					<SheetTitle>Registrar Charla IRL</SheetTitle>
					<SheetDescription>
						Seleccione la empresa y registre la charla IRL para los empleados de la empresa
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid grid-cols-1 items-center justify-between gap-6 overflow-y-auto px-4 pt-4 pb-14"
					>
						<SelectWithSearchFormField
							name="companyId"
							label="Empresa"
							control={form.control}
							disabled={isLoadingCompanies || isSubmitting}
							options={
								companies?.companies?.map((company) => ({
									value: company.id,
									label: company.name,
								})) || []
							}
						/>

						<div className="space-y-4">
							{!form.watch("companyId") ? (
								<p className="text-muted-foreground text-sm">
									Seleccione una empresa para ver sus empleados
								</p>
							) : fields.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No hay empleados registrados para esta empresa
								</p>
							) : (
								<ScrollArea className="h-[70vh] border-t">
									<div className="divide-y">
										{fields.map((employee, index) => (
											<div key={employee.id} className="space-y-4 py-5">
												<p className="flex items-center gap-2 font-semibold">
													<UserIcon className="text-muted-foreground h-4 w-4" />
													{employee.name}
												</p>

												<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
													<DatePickerFormField<IrlSafetyTalkSchema>
														control={form.control}
														label="Fecha de sesión"
														name={`employees.${index}.sessionDate`}
													/>

													<DatePickerFormField<IrlSafetyTalkSchema>
														control={form.control}
														label="Fecha de expiración"
														name={`employees.${index}.expiresAt`}
													/>

													<InputFormField<IrlSafetyTalkSchema>
														min={0}
														max={100}
														type="number"
														label="Puntaje"
														control={form.control}
														name={`employees.${index}.score`}
													/>

													<SwitchFormField<IrlSafetyTalkSchema>
														control={form.control}
														label="¿Charla aprobada?"
														name={`employees.${index}.approved`}
													/>
												</div>
											</div>
										))}
									</div>
								</ScrollArea>
							)}

							{form.formState.errors.employees && (
								<p className="text-destructive text-sm font-medium">
									{form.formState.errors.employees.message}
								</p>
							)}
						</div>

						<div className="flex justify-end">
							<SubmitButton
								isSubmitting={isSubmitting}
								label={isSubmitting ? "Guardando..." : "Guardar registros"}
								className="bg-emerald-600 hover:scale-100 hover:bg-emerald-700"
								disabled={
									isSubmitting || isLoadingCompanies || !form.getValues("employees")?.length
								}
							/>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
