"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"

import { profileFormSchema, type ProfileFormSchema } from "@/project/auth/schemas/profile.schema"
import { updateProfile } from "@/project/user/actions/updateUser"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { Session } from "@/lib/auth"

import { AvatarUploadField } from "@/shared/components/forms/AvatarUploadField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"

interface ProfileFormProps {
	user: Session["user"]
}

export function ProfileForm({ user }: ProfileFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const router = useRouter()

	const form = useForm<ProfileFormSchema>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			name: user.name,
			phone: user.phone || "",
		},
	})

	const onSubmit = async (values: ProfileFormSchema) => {
		setIsSubmitting(true)

		try {
			let imageUrl: string | undefined = undefined

			if (values.image && values.image.file) {
				const uploadResults = await uploadFilesToCloud({
					files: [values.image],
					randomString: user.id,
					containerType: "avatars",
					companyId: user.companyId || undefined,
				})

				if (uploadResults.length > 0) {
					imageUrl = uploadResults[0].url
				}
			}

			const response = await updateProfile({
				userId: user.id,
				values: {
					image: undefined,
					name: values.name,
					phone: values.phone,
				},
				imageUrl,
			})

			if (!response.ok) {
				throw new Error(response.message || "Error al actualizar el perfil")
			}

			toast.success("Perfil actualizado correctamente")
			router.refresh()
		} catch (error) {
			console.error(error)
			toast.error(error instanceof Error ? error.message : "Error al actualizar el perfil")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
					<AvatarUploadField name="image" form={form} className="mb-4" currentImage={user.image} />

					<div className="flex-1 space-y-4">
						<InputFormField<ProfileFormSchema>
							name="name"
							control={form.control}
							label="Nombre completo"
							placeholder="Ingrese su nombre completo"
						/>

						<InputFormField<ProfileFormSchema>
							name="phone"
							control={form.control}
							label="Teléfono"
							placeholder="Ingrese su número de teléfono"
						/>
					</div>
				</div>

				<Button type="submit" className="hover:bg-primary/80 w-full" disabled={isSubmitting}>
					{isSubmitting ? "Actualizando..." : "Actualizar perfil"}
				</Button>
			</form>
		</Form>
	)
}
