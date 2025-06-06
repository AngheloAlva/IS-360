"use client"

import { useForm } from "react-hook-form"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { createStartupFolderWithAll } from "@/actions/startup-folders/createStartupFolderWithAll"
import { zodResolver } from "@hookform/resolvers/zod"
import { queryClient } from "@/lib/queryClient"
import {
	newStartupFolderSchema,
	type NewStartupFolderSchema,
} from "@/lib/form-schemas/startup-folder/new-startup-folder.schema"

import { InputFormField } from "@/components/forms/shared/InputFormField"
import Spinner from "@/components/shared/Spinner"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
	Dialog,
	DialogClose,
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/components/ui/dialog"

interface CreateStartupFolderProps {
	companyId: string
}

export function CreateStartupFolder({ companyId }: CreateStartupFolderProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<NewStartupFolderSchema>({
		resolver: zodResolver(newStartupFolderSchema),
		defaultValues: {
			name: "",
		},
	})

	const onSubmit = async (data: NewStartupFolderSchema) => {
		try {
			setIsSubmitting(true)

			await createStartupFolderWithAll({
				companyId,
				name: data.name,
			})

			queryClient.invalidateQueries({
				queryKey: ["startupFolder", companyId],
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

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button disabled={isSubmitting} className="gap-0 bg-emerald-600 hover:bg-emerald-700">
					<PlusIcon className="mr-2 h-4 w-4" />
					Carpeta de arranque
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
							itemClassName="mb-2"
							control={form.control}
							placeholder="Nombre de la carpeta"
						/>

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
