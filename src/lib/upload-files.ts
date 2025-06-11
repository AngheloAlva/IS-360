import { FileSchema } from "./form-schemas/document-management/file.schema"

interface UploadFilesToCloudProps {
	files: FileSchema[]
	randomString: string
	secondaryName?: string
	containerType: "documents" | "files" | "startup" | "avatars" | "equipment"
	nameStrategy?: "original" | "secondary" | "both"
}

export interface UploadResult {
	url: string
	size: number
	type: string
	name: string
}

export const uploadFilesToCloud = async ({
	files,
	randomString,
	secondaryName,
	containerType,
	nameStrategy,
}: UploadFilesToCloudProps): Promise<UploadResult[]> => {
	// Obtener el SAS token y la información del contenedor
	const sasResponse = await fetch("/api/file", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			filenames: files.map((field) => {
				if (!field.file) {
					throw new Error("No se pudo obtener el archivo")
				}

				const fileExtension = field.file.name.split(".").pop()
				return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${randomString.slice(0, 4)}.${fileExtension}`
			}),
			containerType,
		}),
	})

	if (!sasResponse.ok) {
		throw new Error("Error al obtener URLs de subida")
	}

	const { urls } = await sasResponse.json()
	if (!urls || urls.length !== files.length) {
		throw new Error("Error con las URLs de subida")
	}

	// Subir archivos a Azure Blob Storage
	const uploadPromises = files.map(async (fileData, index) => {
		if (!fileData.file) {
			throw new Error("No se pudo obtener el archivo")
		}

		const uploadUrl = urls[index]
		const blobUrl = uploadUrl.split("?")[0] // URL base sin SAS token

		const uploadResponse = await fetch(uploadUrl, {
			method: "PUT",
			body: fileData.file,
			headers: {
				"Content-Type": fileData.file.type,
				"x-ms-blob-type": "BlockBlob",
			},
		})

		if (!uploadResponse.ok) {
			throw new Error(`Error al subir archivo: ${fileData.file.name}`)
		}

		// Determinar el nombre del archivo según la estrategia elegida
		let fileName
		switch (nameStrategy) {
			case "original":
				fileName = fileData.file.name
				break
			case "secondary":
				fileName = secondaryName || fileData.file.name
				break
			case "both":
				fileName = secondaryName ? `${secondaryName} - ${fileData.file.name}` : fileData.file.name
				break
			default:
				// Comportamiento por defecto (retrocompatible)
				fileName = secondaryName || fileData.file.name
		}

		return {
			url: blobUrl,
			size: fileData.file.size,
			type: fileData.file.type,
			name: fileName,
		}
	})

	const uploadResults = await Promise.all(uploadPromises)

	return uploadResults
}
