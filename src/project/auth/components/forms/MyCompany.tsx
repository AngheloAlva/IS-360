"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { companyFormSchema, type CompanyFormSchema } from "@/project/auth/schemas/company.schema"
import { useCompanyById } from "@/project/company/hooks/use-company-by-id"
import { updateCompany } from "@/project/company/actions/updateMyCompany"
import { uploadFilesToCloud } from "@/lib/upload-files"
import { Session } from "@/lib/auth"

import { AvatarUploadField } from "@/shared/components/forms/AvatarUploadField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { Button } from "@/shared/components/ui/button"
import { Form } from "@/shared/components/ui/form"

interface MyCompanyProps {
	user: Session["user"]
	companyId: string
}

export function MyCompany({ user, companyId }: MyCompanyProps) {
	const router = useRouter()

	const [isSubmitting, setIsSubmitting] = useState(false)

	const { data: companyData } = useCompanyById({ companyId })

	const form = useForm<CompanyFormSchema>({
		resolver: zodResolver(companyFormSchema),
		defaultValues: {
			rut: user.rut,
			name: companyData?.company.name,
			image: {
				fileSize: 0,
				file: undefined,
				url: companyData?.company.image || "",
				title: companyData?.company.name || "",
				preview: companyData?.company.image || "",
			},
		},
	})

	useEffect(() => {
		if (companyData) {
			form.reset({
				rut: companyData.company.rut,
				name: companyData.company.name,
				image: {
					fileSize: 0,
					file: undefined,
					url: companyData.company.image || "",
					title: companyData.company.name || "",
					preview: companyData.company.image || "",
				},
			})
		}
	}, [companyData, form])

	const onSubmit = async (values: CompanyFormSchema) => {
		setIsSubmitting(true)

		try {
			let imageUrl: string | undefined = undefined

			if (values.image && values.image.file) {
				const uploadResults = await uploadFilesToCloud({
					files: [values.image],
					randomString: user.id,
					containerType: "avatars",
				})

				if (uploadResults.length > 0) {
					imageUrl = uploadResults[0].url
				}
			}

			const response = await updateCompany({
				companyId: companyId,
				imageUrl,
			})

			if (!response.ok) {
				throw new Error(response.message || "Error al actualizar la empresa")
			}

			toast.success("Empresa actualizada correctamente")
			router.refresh()
		} catch (error) {
			console.error(error)
			toast.error(error instanceof Error ? error.message : "Error al actualizar la empresa")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
					<AvatarUploadField
						name="image"
						form={form}
						className="mb-4"
						currentImage={companyData?.company.image}
					/>

					<div className="flex-1 space-y-4">
						<InputFormField<CompanyFormSchema>
							readOnly
							name="name"
							label="Nombre empresa"
							control={form.control}
						/>

						<InputFormField<CompanyFormSchema>
							readOnly
							name="rut"
							label="RUT empresa"
							control={form.control}
						/>
					</div>
				</div>

				<Button
					type="submit"
					className="w-full bg-amber-500 hover:bg-amber-600"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Actualizando..." : "Actualizar empresa"}
				</Button>
			</form>
		</Form>
	)
}
