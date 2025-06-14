"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FileEditIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { updateExternalUser } from "@/features/user/actions/updateUser"
import { queryClient } from "@/lib/queryClient"
import {
	updatePartnerUsersSchema,
	type UpdatePartnerUsersSchema,
} from "@/features/user/schemas/update-user.schema"

import { InputFormField } from "@/shared/components/forms/InputFormField"
import { RutFormField } from "@/shared/components/forms/RutFormField"
import SubmitButton from "@/shared/components/forms/SubmitButton"
import { Button } from "@/shared/components/ui/button"

import { Form } from "@/shared/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

import type { UsersByCompany } from "@/features/user/hooks/use-users-by-company"

interface ExternalUserFormProps {
	user: UsersByCompany
}

export default function UpdateExternalUserForm({
	user,
}: ExternalUserFormProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [isOpen, setIsOpen] = useState<boolean>(false)

	const form = useForm<UpdatePartnerUsersSchema>({
		resolver: zodResolver(updatePartnerUsersSchema),
		defaultValues: {
			rut: user.rut,
			name: user.name,
			email: user.email,
			phone: user.phone || "",
			internalRole: user.internalRole || "",
			internalArea: user.internalArea || "",
		},
	})

	async function onSubmit(values: UpdatePartnerUsersSchema) {
		setIsSubmitting(true)

		try {
			const { ok, data } = await updateExternalUser({ userId: user.id, values })

			if (ok) {
				toast("Colaborador actualizado exitosamente", {
					description: `El colaborador ${data?.name} ha sido actualizado exitosamente`,
					duration: 3000,
				})
				form.reset()
				setIsOpen(false)
				queryClient.invalidateQueries({
					queryKey: ["usersByCompany", { companyId: user.companyId }],
				})
			} else {
				toast("Error al actualizar el colaborador", {
					description: "Ocurrió un error al intentar actualizar el colaborador",
					duration: 5000,
				})
			}
		} catch (error) {
			console.error(error)
			toast("Error al actualizar el colaborador", {
				description: "Ocurrió un error al intentar actualizar el colaborador",
				duration: 5000,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger className="hover:bg-accent hover:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
				<FileEditIcon />
				Editar Colaborador
			</SheetTrigger>

			<SheetContent className="sm:max-w-lg">
				<SheetHeader className="shadow">
					<SheetTitle>Editar Colaborador</SheetTitle>
					<SheetDescription>Modifique los datos del colaborador</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-3 gap-y-5 overflow-y-auto px-4 pb-14 sm:grid-cols-2"
					>
						<InputFormField<UpdatePartnerUsersSchema>
							name="name"
							label="Nombre"
							placeholder="Nombre"
							control={form.control}
						/>

						<InputFormField<UpdatePartnerUsersSchema>
							readOnly
							disabled
							name="email"
							type="email"
							label="Email"
							placeholder="Email"
							control={form.control}
						/>

						<RutFormField<UpdatePartnerUsersSchema>
							name="rut"
							label="RUT"
							placeholder="RUT"
							control={form.control}
						/>

						<InputFormField<UpdatePartnerUsersSchema>
							optional
							name="phone"
							label="Teléfono"
							placeholder="Teléfono"
							control={form.control}
						/>

						<InputFormField<UpdatePartnerUsersSchema>
							optional
							label="Cargo"
							name="internalRole"
							placeholder="Cargo"
							control={form.control}
						/>

						<InputFormField<UpdatePartnerUsersSchema>
							optional
							label="Area"
							name="internalArea"
							placeholder="Area"
							control={form.control}
						/>

						<div className="mt-4 flex items-center justify-end gap-2 sm:col-span-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
								className="w-1/2 border-2 border-orange-900 text-orange-700 transition-all hover:scale-105 hover:bg-orange-900 hover:text-white"
							>
								Cancelar
							</Button>

							<SubmitButton
								isSubmitting={isSubmitting}
								label="Actualizar Colaborador"
								className="w-1/2 bg-orange-600 hover:bg-orange-700"
							/>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
