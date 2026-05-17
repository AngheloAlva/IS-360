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

function resolveDemoFileName(
	originalName: string,
	secondaryName: string | undefined,
	nameStrategy: "original" | "secondary" | "both",
): string {
	switch (nameStrategy) {
		case "secondary":
			return sanitizeFilename(secondaryName || originalName)
		case "both":
			return secondaryName
				? sanitizeFilename(`${secondaryName} - ${originalName}`)
				: sanitizeFilename(originalName)
		case "original":
		default:
			return sanitizeFilename(originalName)
	}
}

/**
 * Demo implementation: skips the SAS / Azure dance entirely and uses
 * URL.createObjectURL to produce a blob URL that the browser can render for the
 * lifetime of the page. Persisting files across reloads is out of scope for the
 * demo (PGlite keeps the file metadata + url; on reload, the blob URL is dead
 * but rows survive).
 */
export const uploadFilesToCloud = async ({
	files,
	secondaryName,
	nameStrategy = "original",
}: UploadFilesToCloudProps): Promise<UploadResult[]> => {
	return files.map((fileData) => {
		if (!fileData.file) {
			throw new Error("No se pudo obtener el archivo")
		}
		const url = URL.createObjectURL(fileData.file)
		return {
			url,
			size: fileData.file.size,
			type: fileData.file.type,
			name: resolveDemoFileName(fileData.file.name, secondaryName, nameStrategy),
		}
	})
}

export const uploadBufferToCloud = async ({
	buffer,
	filename,
	contentType,
}: {
	buffer: Buffer
	filename: string
	contentType: string
	containerType: "documents" | "files" | "startup" | "avatars" | "equipment"
}): Promise<UploadResult> => {
	const blob = new Blob([new Uint8Array(buffer)], { type: contentType })
	const url = URL.createObjectURL(blob)
	return {
		url,
		size: buffer.length,
		type: contentType,
		name: sanitizeFilename(filename),
	}
}
