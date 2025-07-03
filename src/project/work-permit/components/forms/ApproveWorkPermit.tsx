"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { approveOrRejectWorkPermit } from "../../actions/admin/approveOrRejectPermit"
import { queryClient } from "@/lib/queryClient"
import {
	ApproveWorkPermitSchema,
	approveWorkPermitSchema,
} from "../../schemas/approve-work-permit.schema"

import { SelectWithSearchFormField } from "@/shared/components/forms/SelectWithSearchFormField"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { useOperators } from "@/shared/hooks/use-operators"
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

export default function ApproveWorkPermit({
	workPermitId,
}: {
	workPermitId: string
}): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<ApproveWorkPermitSchema>({
		resolver: zodResolver(approveWorkPermitSchema),
		defaultValues: {
			action: "approve",
			approvedBy: "",
		},
	})

	const { data: operators, isLoading } = useOperators({
		page: 1,
		limit: 100,
	})

	const onSubmit = async (values: ApproveWorkPermitSchema) => {
		setIsSubmitting(true)

		try {
			const res = await approveOrRejectWorkPermit({ workPermitId, values })

			if (!res.ok) {
				toast.error("Error al aprobar el permiso de trabajo", {
					description: res.message,
					duration: 3000,
				})
				return
			}

			toast.success("Permiso de trabajo aprobado exitosamente", {
				duration: 3000,
			})
			queryClient.invalidateQueries({
				queryKey: ["workPermits"],
			})
		} catch (error) {
			console.error(error)
			toast.error("Error al aprobar el permiso de trabajo", {
				duration: 3000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const action = form.watch("action")
	const approvedBy = form.watch("approvedBy")

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					size={"icon"}
					variant={"ghost"}
					className="cursor-pointer text-cyan-500 hover:bg-cyan-500 hover:text-white"
				>
					<CheckCircleIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Aprobar o Rechazar Permiso de Trabajo</DialogTitle>
							<DialogDescription>
								¿Estás seguro de aprobar este permiso de trabajo?
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-6">
							<FormField
								control={form.control}
								name="action"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
												className="flex flex-col"
											>
												<FormItem className="flex items-center gap-3">
													<FormControl>
														<RadioGroupItem value="approve" />
													</FormControl>
													<FormLabel className="font-normal">Aprobar</FormLabel>
												</FormItem>
												<FormItem className="flex items-center gap-3">
													<FormControl>
														<RadioGroupItem value="reject" />
													</FormControl>
													<FormLabel className="font-normal">Rechazar</FormLabel>
												</FormItem>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<SelectWithSearchFormField
								name="approvedBy"
								label="Aprobado por"
								control={form.control}
								options={
									operators?.operators.map((operator) => ({
										value: operator.id,
										label: operator.name,
									})) ?? []
								}
							/>
						</div>

						<DialogFooter className="mt-4 flex">
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancelar
								</Button>
							</DialogClose>

							<SubmitButton
								isSubmitting={isSubmitting}
								disabled={isLoading || approvedBy === ""}
								label={action === "approve" ? "Aprobar" : "Rechazar"}
								className="h-9 w-fit cursor-pointer bg-cyan-500 transition-all hover:scale-105 hover:bg-cyan-600"
							/>
						</DialogFooter>
					</DialogContent>
				</form>
			</Form>
		</Dialog>
	)
}
