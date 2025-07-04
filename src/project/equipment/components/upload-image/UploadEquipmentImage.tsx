"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog"

interface UploadEquipmentImageProps {
	equipmentId: string
	currentImageUrl?: string | null
	onSuccess?: (imageUrl: string) => void
}

export function UploadEquipmentImage({
	equipmentId,
	currentImageUrl,
	onSuccess,
}: UploadEquipmentImageProps) {
	const [open, setOpen] = useState(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const router = useRouter()

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null
		setSelectedFile(file)

		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setPreviewUrl(reader.result as string)
			}
			reader.readAsDataURL(file)
		} else {
			setPreviewUrl(null)
		}
	}

	const handleUpload = async () => {
		if (!selectedFile) return

		setIsUploading(true)
		const formData = new FormData()
		formData.append("image", selectedFile)

		try {
			const response = await fetch(`/api/equipments/${equipmentId}/upload-image`, {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || "Error al subir la imagen")
			}

			const data = await response.json()

			toast.success("Imagen subida correctamente", {
				description: "La imagen del equipo ha sido actualizada.",
			})

			if (onSuccess && data.equipment.imageUrl) {
				onSuccess(data.equipment.imageUrl)
			}

			// Refrescar la página para mostrar la nueva imagen
			router.refresh()
			setOpen(false)
		} catch (error) {
			console.error("Error al subir imagen:", error)
			toast.error("Error al subir imagen", {
				description: error instanceof Error ? error.message : "Ha ocurrido un error inesperado",
			})
		} finally {
			setIsUploading(false)
		}
	}

	const handleClearSelection = () => {
		setSelectedFile(null)
		setPreviewUrl(null)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="flex items-center gap-2">
					<Camera className="h-4 w-4" />
					{currentImageUrl ? "Cambiar imagen" : "Subir imagen"}
				</Button>
			</DialogTrigger>

			<DialogContent className="w-fit sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Subir imagen del equipo</DialogTitle>
					<DialogDescription>
						Sube una imagen para identificar visualmente este equipo.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					{previewUrl ? (
						<div className="relative mx-auto h-64 w-full overflow-hidden rounded-md border">
							<Image src={previewUrl} alt="Vista previa" fill className="object-cover" />
							<Button
								size="icon"
								variant="destructive"
								onClick={handleClearSelection}
								className="absolute top-2 right-2 h-8 w-8 cursor-pointer"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<div className="flex flex-col items-center gap-4">
							<div
								className="border-muted-foreground hover:bg-muted flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 transition-colors"
								onClick={() => document.getElementById("equipment-image")?.click()}
							>
								<Upload className="mb-2 h-8 w-8 text-gray-400" />
								<p className="mb-2 text-sm font-medium">
									Arrastra una imagen o haz clic para seleccionar
								</p>
								<p className="text-xs text-gray-500">PNG, JPG o GIF (máx. 5MB)</p>
							</div>
							<input
								type="file"
								id="equipment-image"
								accept="image/*"
								className="hidden"
								onChange={handleFileChange}
							/>
							<Button
								variant="secondary"
								className="w-full cursor-pointer"
								onClick={() => document.getElementById("equipment-image")?.click()}
							>
								Seleccionar archivo
							</Button>
						</div>
					)}
				</div>

				<DialogFooter className="sm:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isUploading}
					>
						Cancelar
					</Button>
					<Button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
						{isUploading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Subiendo...
							</>
						) : (
							"Subir imagen"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
