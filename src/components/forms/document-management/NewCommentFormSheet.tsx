"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { newComment } from "@/actions/document-management/newComment"
import {
	commentSchema,
	type CommentSchema,
} from "@/lib/form-schemas/document-management/comment.schema"

import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Form } from "@/components/ui/form"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/components/ui/sheet"

interface NewCommentProps {
	fileId: string
	userId: string
}

export default function NewCommentFormSheet({
	fileId,
	userId,
}: NewCommentProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [open, setOpen] = useState(false)

	const router = useRouter()

	const form = useForm<CommentSchema>({
		resolver: zodResolver(commentSchema),
		defaultValues: {
			fileId,
			userId,
			content: "",
		},
	})

	const onSubmit = async (values: CommentSchema) => {
		setIsSubmitting(true)

		try {
			const { ok, message } = await newComment({ values })

			if (!ok) {
				toast.error("Error al crear el comentario", {
					description: message,
				})
			} else {
				toast.success("Comentario creado exitosamente")
				setOpen(false)
				router.refresh()
			}
		} catch (error) {
			console.log(error)
			toast.error("Error al crear el comentario")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className="text-primary flex w-fit items-center justify-start gap-1 bg-transparent text-sm hover:underline"
				onClick={() => setOpen(true)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				<span className="hidden text-nowrap sm:inline">Nueva Comentario</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Nuevo comentario</SheetTitle>
					<SheetDescription>
						Complete el formulario para crear un nuevo comentario.
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="mx-auto flex w-full max-w-lg flex-col gap-y-5 px-4 pt-4"
					>
						<TextAreaFormField<CommentSchema>
							name="content"
							control={form.control}
							label="Escribe un comentario"
							placeholder="Comentario..."
						/>

						<SubmitButton
							label="Agregar comentario"
							isSubmitting={isSubmitting}
							className="hover:bg-primary/80"
						/>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	)
}
