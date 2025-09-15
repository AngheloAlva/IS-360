"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CircleCheckBigIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { updateLockoutPermitStatus } from "../../actions/admin/updateLockoutPermitStatus"
import { LOCKOUT_PERMIT_STATUS } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"

import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
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

const completeLockoutPermitSchema = z.object({
	id: z.string().min(1, { message: "ID del permiso de bloqueo es requerido" }),
	finalObservations: z.string().optional(),
})

type CompleteLockoutPermitSchema = z.infer<typeof completeLockoutPermitSchema>

export default function CompleteLockoutPermit({
	lockoutPermitId,
}: {
	lockoutPermitId: string
}): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<CompleteLockoutPermitSchema>({
		resolver: zodResolver(completeLockoutPermitSchema),
		defaultValues: {
			id: lockoutPermitId,
			finalObservations: "",
		},
	})

	async function onSubmit(values: CompleteLockoutPermitSchema) {
		setIsSubmitting(true)

		try {
			const result = await updateLockoutPermitStatus({
				id: values.id,
				status: LOCKOUT_PERMIT_STATUS.COMPLETED,
				approvalNotes: values.finalObservations,
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
			toast.error("Error al completar el permiso de bloqueo")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog>
			<DialogTrigger className="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-3 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
				<CircleCheckBigIcon className="h-4 w-4 text-lime-600" />
				Completar
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CircleCheckBigIcon className="h-5 w-5 text-green-600" />
						Completar Permiso de Bloqueo
					</DialogTitle>
					<DialogDescription>
						Al completar este permiso, se marcará como finalizado y no se podrá editar. Puede
						agregar observaciones finales sobre la ejecución del trabajo.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<TextAreaFormField
							control={form.control}
							name="finalObservations"
							label="Observaciones Finales (Opcional)"
							placeholder="Ingresa observaciones finales del cierre..."
							optional
						/>

						<DialogFooter>
							<DialogClose asChild>
								<Button
									size="lg"
									type="button"
									variant="outline"
									className="w-1/3"
									disabled={isSubmitting}
								>
									Cancelar
								</Button>
							</DialogClose>
							<SubmitButton
								className="w-2/3"
								label="Completar Permiso"
								isSubmitting={isSubmitting}
							/>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
