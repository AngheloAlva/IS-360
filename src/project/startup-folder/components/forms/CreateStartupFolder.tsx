"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { createStartupFolder } from "../../actions/createStartupFolder"
import { StartupFolderType } from "@prisma/client"
import { queryClient } from "@/lib/queryClient"
import {
	newStartupFolderSchema,
	type NewStartupFolderSchema,
} from "@/project/startup-folder/schemas/new-startup-folder.schema"

import { SwitchFormField } from "@/shared/components/forms/SwitchFormField"
import { SelectFormField } from "@/shared/components/forms/SelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"
import Spinner from "@/shared/components/Spinner"
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

interface CreateStartupFolderProps {
	companyId: string
}

export function CreateStartupFolder({ companyId }: CreateStartupFolderProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	const form = useForm<NewStartupFolderSchema>({
		resolver: zodResolver(newStartupFolderSchema),
		defaultValues: {
			name: "",
			moreMonthDuration: false,
			type: StartupFolderType.FULL,
		},
	})

	const onSubmit = async (data: NewStartupFolderSchema) => {
		try {
			setIsSubmitting(true)

			await createStartupFolder({
				companyId,
				name: data.name,
				type: data.type,
				moreMonthDuration:
					folderType === StartupFolderType.FULL ? data.moreMonthDuration || false : false,
			})

			queryClient.invalidateQueries({
				queryKey: ["startupFolder", { companyId }],
			})

			setIsOpen(false)
			form.reset()
			toast.success("Carpeta creada exitosamente")
		} catch (error) {
			console.error(error)
			toast.error("Ocurrió un error al crear la carpeta")
		} finally {
			setIsSubmitting(false)
		}
	}

	const folderType = form.watch("type")

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					disabled={isSubmitting}
					className="gap-0 bg-white font-medium text-teal-600 transition-all hover:scale-105 hover:bg-white hover:text-teal-600"
				>
					<PlusCircleIcon className="mr-2 h-4 w-4" />
					Carpeta de Arranque
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Nueva carpeta de arranque</DialogTitle>
					<DialogDescription>
						Ingresa el nombre para la nueva carpeta de arranque.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<InputFormField<NewStartupFolderSchema>
							name="name"
							label="Nombre"
							control={form.control}
							placeholder="Nombre de la carpeta"
						/>

						<SelectFormField<NewStartupFolderSchema>
							name="type"
							label="Tipo de carpeta"
							control={form.control}
							options={[
								{ value: StartupFolderType.FULL, label: "Carpeta de arranque" },
								{ value: StartupFolderType.BASIC, label: "Documentos basicos" },
							]}
						/>

						{folderType === StartupFolderType.FULL && (
							<SwitchFormField
								control={form.control}
								name="moreMonthDuration"
								label="¿La empresa estará más de un mes?"
							/>
						)}

						<DialogFooter className="mt-4 gap-2">
							<DialogClose asChild>
								<Button type="button" variant="outline" onClick={() => form.reset()}>
									Cancelar
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="bg-emerald-600 hover:bg-emerald-700"
							>
								{isSubmitting ? <Spinner /> : "Crear carpeta"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
