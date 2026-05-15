"use client"

import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { registerInPersonSafetyTalk } from "@/project/safety-talk/actions/register-in-person-safety-talk"
import {
	inPersonSafetyTalkSchema,
	type InPersonSafetyTalkSchema,
} from "@/project/safety-talk/schemas/in-person-safety-talk.schema"
import { cn } from "@/lib/utils"

import { InputWithPrefixFormField } from "@/shared/components/forms/InputWithPrefixFormField"
import { DatePickerFormField } from "@/shared/components/forms/DatePickerFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { RutFormField } from "@/shared/components/forms/RutFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Textarea } from "@/shared/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

export function InPersonSafetyTalkForm() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)
	const queryClient = useQueryClient()

	const form = useForm<InPersonSafetyTalkSchema>({
		resolver: zodResolver(inPersonSafetyTalkSchema as any),
		defaultValues: {
			rut: "",
			name: "",
			company: "",
			category: undefined,
			sessionDate: new Date(),
			expiresAt: undefined,
			score: undefined,
			notes: "",
			status: "PASSED",
		},
	})

	const onSubmit = async (data: InPersonSafetyTalkSchema) => {
		try {
			setIsSubmitting(true)

			const result = await registerInPersonSafetyTalk(data)

			if (result.ok) {
				toast.success(result.message)
				form.reset({
					rut: "",
					name: "",
					company: "",
					category: undefined,
					sessionDate: new Date(),
					expiresAt: undefined,
					score: undefined,
					notes: "",
					status: "PASSED",
				})
    void queryClient.invalidateQueries({ queryKey: ["in-person-safety-talks"] })
				setOpen(false)
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al registrar la charla presencial")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className={cn(
					"flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-semibold text-emerald-600 transition-all hover:scale-105 dark:text-emerald-700"
				)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				Registrar Charla Presencial
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-lg">
				<SheetHeader className="shadow">
					<SheetTitle>Registrar Charla Presencial</SheetTitle>
					<SheetDescription>
						Registre una charla de seguridad presencial para un contratista o visitante
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid grid-cols-1 items-center justify-between gap-6 overflow-y-auto px-4 pt-4 pb-14"
					>
						<RutFormField<InPersonSafetyTalkSchema>
							name="rut"
							label="RUT"
							placeholder="12.345.678-9"
							control={form.control}
						/>

						<InputFormField<InPersonSafetyTalkSchema>
							name="name"
							label="Nombre"
							placeholder="Juan Pérez"
							control={form.control}
							disabled={isSubmitting}
						/>

						<InputFormField<InPersonSafetyTalkSchema>
							name="company"
							label="Empresa"
							placeholder="Empresa SpA"
							control={form.control}
							disabled={isSubmitting}
						/>

						<FormField
							name="category"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tipo de charla (opcional)</FormLabel>
									<Select
										value={field.value ?? ""}
										onValueChange={(value) => field.onChange(value || undefined)}
										disabled={isSubmitting}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Seleccionar tipo..." />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="IRL">IRL</SelectItem>
											<SelectItem value="VISITOR_TRM">Visita TRM</SelectItem>
											<SelectItem value="VISITOR">Visita PRS</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex items-start gap-2">
							<DatePickerFormField<InPersonSafetyTalkSchema>
								control={form.control}
								label="Fecha de sesión"
								itemClassName="flex-1 content-start"
								name="sessionDate"
							/>

							<DatePickerFormField<InPersonSafetyTalkSchema>
								control={form.control}
								label="Vencimiento (opcional)"
								itemClassName="flex-1 content-start"
								name="expiresAt"
							/>
						</div>

						<InputWithPrefixFormField<InPersonSafetyTalkSchema>
							min={0}
							max={100}
							prefix="%"
							type="number"
							position="end"
							label="Puntaje (opcional)"
							placeholder="85"
							itemClassName="w-fit"
							control={form.control}
							name="score"
						/>

						<FormField
							name="notes"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notas (opcional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Observaciones adicionales..."
											disabled={isSubmitting}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end">
							<SubmitButton
								isSubmitting={isSubmitting}
								label={isSubmitting ? "Guardando..." : "Guardar registro"}
								className="bg-emerald-600 hover:scale-100 hover:bg-emerald-700"
								disabled={isSubmitting}
							/>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
