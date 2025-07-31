/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Building, UploadCloud, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"

import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import { FileSchema } from "@/shared/schemas/file.schema"
import { getImageProps } from "next/image"

interface AvatarUploadFieldProps<T extends FieldValues> {
	name: FieldPath<T>
	form: UseFormReturn<T>
	currentImage?: string | null
	className?: string
}

export function AvatarUploadField<T extends FieldValues>({
	name,
	form,
	className,
	currentImage,
}: AvatarUploadFieldProps<T>) {
	const [isDragging, setIsDragging] = useState(false)

	const handleFileChange = async (files: FileList | null) => {
		if (!files || files.length === 0) return

		const file = files[0]

		if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/)) {
			toast.error("Formato no soportado", {
				description: "Solo se permiten imágenes JPG, PNG, y WebP",
			})
			return
		}

		const preview = URL.createObjectURL(file)

		const newImage: FileSchema = {
			file,
			preview,
			type: file.type,
			title: file.name,
			fileSize: file.size,
			mimeType: file.type,
			url: currentImage || "",
		}

		form.setValue(name, newImage as any)
	}

	const handleRemoveImage = () => {
		form.setValue(name, {
			file: undefined,
			preview: "",
			type: "",
			title: "Imagen de perfil",
			fileSize: 0,
			mimeType: "image/jpeg",
			url: currentImage || "",
		} as any)
	}

	const image = form.watch(name) as FileSchema | undefined

	const { props } = getImageProps({
		width: 32,
		height: 32,
		alt: image?.title || "",
		src: image?.preview || currentImage || "",
	})

	return (
		<div className={cn("relative", className)}>
			<div className="group relative">
				<Avatar className="h-24 w-24 transition-all duration-300 group-hover:scale-105">
					<AvatarImage {...props} />

					<AvatarFallback className="text-lg">
						<Building className="h-8 w-8" />
					</AvatarFallback>
				</Avatar>

				<div className="absolute -right-2 -bottom-2">
					<Button
						size="icon"
						type="button"
						variant="secondary"
						onClick={() => document.getElementById("avatar-upload")?.click()}
						className="size-8 rounded-full border border-white/50 transition-colors duration-300 group-hover:bg-white group-hover:text-black"
					>
						<UploadCloud className="h-4 w-4" />
					</Button>
				</div>

				<label
					htmlFor="avatar-upload"
					className={cn(
						"absolute inset-0 cursor-pointer rounded-full opacity-0 transition-opacity group-hover:bg-white group-hover:opacity-10",
						{
							"bg-purple-500/50": isDragging,
						}
					)}
					onDragOver={(e) => {
						e.preventDefault()
						e.stopPropagation()
						setIsDragging(true)
					}}
					onDragEnter={(e) => {
						e.preventDefault()
						e.stopPropagation()
						setIsDragging(true)
					}}
					onDragLeave={(e) => {
						e.preventDefault()
						e.stopPropagation()
						setIsDragging(false)
					}}
					onDrop={(e) => {
						e.preventDefault()
						e.stopPropagation()
						setIsDragging(false)
						handleFileChange(e.dataTransfer.files)
					}}
				></label>

				<input
					id="avatar-upload"
					type="file"
					className="hidden"
					accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
					onChange={(e) => handleFileChange(e.target.files)}
				/>
			</div>

			{image && image.preview && (
				<Button
					size="icon"
					type="button"
					variant="destructive"
					onClick={handleRemoveImage}
					className="absolute -top-2 -right-2 size-7 cursor-pointer rounded-full hover:bg-red-500"
				>
					<X className="h-4 w-4" />
				</Button>
			)}
		</div>
	)
}
