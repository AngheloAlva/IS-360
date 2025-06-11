"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { addWorkRequestComment } from "@/actions/work-requests/add-work-request-comment"
import { toast } from "sonner"

const formSchema = z.object({
	content: z.string().min(1, "El comentario no puede estar vacío"),
})

interface CommentDialogProps {
	open: boolean
	userId: string
	workRequestId: string
	onOpenChange: (open: boolean) => void
}

export default function CommentDialog({
	userId,
	workRequestId,
	open,
	onOpenChange,
}: CommentDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: "",
		},
	})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsSubmitting(true)

		try {
			const result = await addWorkRequestComment(
				{
					workRequestId,
					content: values.content,
				},
				userId
			)

			if (result.error) {
				toast.error("Error", {
					description: result.error,
				})
			} else {
				toast.success("Éxito", {
					description: "Comentario agregado correctamente",
				})
				form.reset()
				onOpenChange(false)
				// Recargar la página para ver el nuevo comentario
				window.location.reload()
			}
		} catch (error) {
			console.error("Error al agregar el comentario:", error)
			toast.error("Error", {
				description: "Error al agregar comentario",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Agregar comentario</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											placeholder="Escribe tu comentario aquí..."
											className="min-h-[120px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Guardando..." : "Guardar comentario"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
