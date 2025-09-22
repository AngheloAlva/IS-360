export function generateViewUrl(
	filename: string,
	containerType: "documents" | "files" | "startup" | "avatars" | "equipment" = "documents",
	companyId?: string
): string {
	const params = new URLSearchParams({
		filename,
		containerType,
	})

	if (companyId) {
		params.set("companyId", companyId)
	}

	return `/api/file/view?${params.toString()}`
}

export async function openDocumentSecurely(
	filename: string,
	containerType: "documents" | "files" | "startup" | "avatars" | "equipment" = "documents",
	companyId?: string
): Promise<void> {
	const viewUrl = generateViewUrl(filename, containerType, companyId)
	const res = await fetch(viewUrl)

	if (res.status === 403) {
		const errorData = await res.json()
		alert(`Acceso denegado: ${errorData.reason || "Sin permisos para ver este archivo"}`)
		return
	}

	if (!res.ok) {
		alert("Error al acceder al archivo")
		return
	}

	console.log(res.url)
	window.open(res.url, "_blank", "noopener,noreferrer")
}

export const extractFilenameFromUrl = (url: string): string | null => {
	try {
		const urlParts = url.split("/")
		const filenameWithQuery = urlParts[urlParts.length - 1]

		const filename = filenameWithQuery.split("?")[0]

		return filename || null
	} catch (error) {
		console.error("Error extrayendo filename de URL:", error)
		return null
	}
}
