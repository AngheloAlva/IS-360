"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { commentSchema, CommentSchema } from "@/lib/form-schemas/document-management/comment.schema"
import { newComment } from "@/actions/document-management/newComment"

import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import SubmitButton from "@/components/forms/shared/SubmitButton"
import { Form } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"

interface NewCommentProps {
	fileId: string
	userId: string
	lastPath?: string
}

export default function NewComment({
	fileId,
	userId,
	lastPath,
}: NewCommentProps): React.ReactElement {
	const [isSubmitting, setIsSubmitting] = useState(false)
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
				router.push(lastPath || "/dashboard/documentacion")
			}
		} catch (error) {
			console.log(error)
			toast.error("Error al crear el comentario")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mx-auto flex w-full max-w-lg flex-col gap-3"
			>
				<Card>
					<CardContent>
						<TextAreaFormField<CommentSchema>
							name="content"
							control={form.control}
							label="Escribe un comentario"
							placeholder="Escribe un comentario"
						/>
					</CardContent>
				</Card>

				<SubmitButton label="Enviar" isSubmitting={isSubmitting} className="hover:bg-primary/80" />
			</form>
		</Form>
	)
}
