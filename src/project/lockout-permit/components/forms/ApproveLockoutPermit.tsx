"use client"

import { CheckCircleIcon, XCircleIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { approveLockoutPermit } from "../../actions/admin/approveLockoutPermit"
import { queryClient } from "@/lib/queryClient"
import {
	ApproveLockoutPermitSchema,
	approveLockoutPermitSchema,
} from "../../schemas/approve-lockout-permit.schema"

import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import {
	Form,
	FormItem,
	FormField,
	FormLabel,
	FormMessage,
	FormControl,
} from "@/shared/components/ui/form"

export default function ApproveLockoutPermit({
	lockoutPermitId,
}: {
	lockoutPermitId: string
}): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<ApproveLockoutPermitSchema>({
		resolver: zodResolver(approveLockoutPermitSchema),
		defaultValues: {
			id: lockoutPermitId,
			approved: true,
			approvalNotes: "",
		},
	})

	async function onSubmit(values: ApproveLockoutPermitSchema) {
		setIsSubmitting(true)

		try {
			const result = await approveLockoutPermit({
				id: values.id,
				approved: values.approved,
				approvalNotes: values.approvalNotes,
			})

			if (result.ok) {
				toast.success(result.message)
				await queryClient.invalidateQueries({ queryKey: ["lockout-permits"] })
				await queryClient.invalidateQueries({ queryKey: ["lockout-permit-stats"] })
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error(error)
			toast.error("Error al procesar el permiso de bloqueo")
		} finally {
			setIsSubmitting(false)
		}
	}

	useEffect(() => {
		console.log(form.formState.errors)
	}, [form.formState.errors])

	const watchApproved = form.watch("approved")

	return (
		<Dialog>
			<DialogTrigger className="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-3 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
				<CheckCircleIcon className="h-4 w-4 text-lime-600" />
				Revisar
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{watchApproved ? (
							<CheckCircleIcon className="h-5 w-5 text-green-600" />
						) : (
							<XCircleIcon className="h-5 w-5 text-red-600" />
						)}
						{watchApproved ? "Aprobar" : "Rechazar"} Permiso de Bloqueo
					</DialogTitle>
					<DialogDescription>
						{watchApproved
							? "Al aprobar este permiso, estará disponible para ejecutar el bloqueo."
							: "Al rechazar este permiso, deberá proporcionar observaciones para corrección."}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="approved"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel>Decisión</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={(value) => field.onChange(value === "true")}
											value={field.value ? "true" : "false"}
											className="flex space-x-6"
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="true" id="approve" />
												<label
													htmlFor="approve"
													className="flex items-center gap-2 text-sm font-medium text-green-700"
												>
													<CheckCircleIcon className="h-4 w-4" />
													Aprobar
												</label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="false" id="reject" />
												<label
													htmlFor="reject"
													className="flex items-center gap-2 text-sm font-medium text-red-700"
												>
													<XCircleIcon className="h-4 w-4" />
													Rechazar
												</label>
											</div>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<TextAreaFormField
							name="approvalNotes"
							label="Observaciones"
							control={form.control}
							optional={watchApproved}
							placeholder="Ingresa observaciones adicionales..."
						/>

						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline" disabled={isSubmitting} className="w-1/2">
									Cancelar
								</Button>
							</DialogClose>

							<SubmitButton
								isSubmitting={isSubmitting}
								className="w-1/2"
								label="Guardar Decisión"
							/>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
