"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SquarePenIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { updateStartupFolder } from "@/project/startup-folder/actions/updateStartupFolder"
import { queryClient } from "@/lib/queryClient"
import {
	newStartupFolderSchema,
	type NewStartupFolderSchema,
} from "@/project/startup-folder/schemas/new-startup-folder.schema"

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

interface UpdateStartupFolderProps {
	startupFolderId: string
	companyId: string
	name: string
	type: "BASIC" | "FULL"
}

export function UpdateStartupFolder({
	type,
	name,
	companyId,
	startupFolderId,
}: UpdateStartupFolderProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<NewStartupFolderSchema>({
		resolver: zodResolver(newStartupFolderSchema),
		defaultValues: {
			name,
			type,
		},
	})

	const onSubmit = async (data: NewStartupFolderSchema) => {
		try {
			setIsSubmitting(true)

			await updateStartupFolder({
				startupFolderId,
				name: data.name,
			})

   void queryClient.invalidateQueries({
				queryKey: ["startupFolder", companyId],
			})

			setIsOpen(false)
			form.reset()
			toast.success("Carpeta actualizada exitosamente")
		} catch (error) {
			console.error(error)
			toast.error("Ocurrió un error al actualizar la carpeta")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					size={"lg"}
					variant="outline"
					disabled={isSubmitting}
					className="border-cyan-500/20 text-cyan-500 hover:bg-cyan-500 hover:text-white"
				>
					<SquarePenIcon />
					Actualizar
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-131.25">
				<DialogHeader>
					<DialogTitle>Actualizar carpeta</DialogTitle>
					<DialogDescription>Ingresa el nombre para la carpeta.</DialogDescription>
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
								className="bg-cyan-600 hover:bg-cyan-700"
							>
								{isSubmitting ? <Spinner /> : "Actualizar carpeta"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
