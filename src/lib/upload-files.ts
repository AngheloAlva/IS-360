import { FileSchema } from "@/shared/schemas/file.schema"

interface UploadFilesToCloudProps {
	files: FileSchema[]
	companyId?: string
	randomString: string
	secondaryName?: string
	nameStrategy?: "original" | "secondary" | "both"
	containerType: "documents" | "files" | "startup" | "avatars" | "equipment"
}

export interface UploadResult {
	url: string
	size: number
	type: string
	name: string
}

function sanitizeFilename(filename: string): string {
	return filename
		.replace(/[<>:"/\\|?*]/g, "_")
		.replace(/_{2,}/g, "_")
		.substring(0, 255)
}

export const uploadFilesToCloud = async ({
	files,
	randomString,
	secondaryName,
	containerType,
	companyId,
	nameStrategy = "original",
}: UploadFilesToCloudProps): Promise<UploadResult[]> => {
	const sasResponse = await fetch("/api/file", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Requested-With": "XMLHttpRequest",
		},
		body: JSON.stringify({
			filenames: files.map((field) => {
				if (!field.file) {
					throw new Error("No se pudo obtener el archivo")
				}

				const fileExtension = field.file.name.split(".").pop()
				return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${randomString.slice(0, 4)}.${fileExtension}`
			}),
			containerType,
			companyId,
		}),
	})

	console.log("sasResponse", sasResponse)

	if (!sasResponse.ok) {
		if (sasResponse.status === 403) {
			const errorData = await sasResponse.json()
			throw new Error(`Acceso denegado: ${errorData.reason || "Sin permisos para subir archivos"}`)
		}
		const errorText = await sasResponse.text()
		throw new Error(`Error al obtener URLs de subida: ${errorText}`)
	}

	const { urls } = await sasResponse.json()
	if (!urls || urls.length !== files.length) {
		throw new Error("Error con las URLs de subida")
	}

	const uploadPromises = files.map(async (fileData, index) => {
		if (!fileData.file) {
			throw new Error("No se pudo obtener el archivo")
		}

		const uploadUrl = urls[index]
		const blobUrl = uploadUrl.split("?")[0]

		if (!uploadUrl.startsWith("https://")) {
			throw new Error("URL de subida no segura")
		}

		const uploadResponse = await fetch(uploadUrl, {
			method: "PUT",
			body: fileData.file,
			headers: {
				"Content-Type": fileData.file.type,
				"x-ms-blob-type": "BlockBlob",
				"x-ms-blob-content-disposition": "attachment",
				"x-ms-blob-cache-control": "no-cache",
			},
		})

		if (!uploadResponse.ok) {
			const errorText = await uploadResponse.text()
			throw new Error(`Error al subir archivo ${fileData.file.name}: ${errorText}`)
		}

		let fileName
		switch (nameStrategy) {
			case "original":
				fileName = sanitizeFilename(fileData.file.name)
				break
			case "secondary":
				fileName = sanitizeFilename(secondaryName || fileData.file.name)
				break
			case "both":
				fileName = secondaryName
					? sanitizeFilename(`${secondaryName} - ${fileData.file.name}`)
					: sanitizeFilename(fileData.file.name)
				break
			default:
				fileName = sanitizeFilename(secondaryName || fileData.file.name)
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
