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

	const data = await res.json()

	if (!data.url) {
		alert("Error: No se pudo obtener la URL del archivo")
		return
	}

	window.open(data.url, "_blank", "noopener,noreferrer")
}

export async function downloadDocumentSecurely(
	filename: string,
	containerType: "documents" | "files" | "startup" | "avatars" | "equipment" = "documents",
	companyId?: string
): Promise<void> {
	const params = new URLSearchParams({
		filename,
		containerType,
	})

	if (companyId) {
		params.set("companyId", companyId)
	}

	const downloadUrl = `/api/file?${params.toString()}`
	const res = await fetch(downloadUrl)

	if (res.status === 403) {
		const errorData = await res.json()
		alert(`Acceso denegado: ${errorData.reason || "Sin permisos para descargar este archivo"}`)
		return
	}

	if (!res.ok) {
		alert("Error al acceder al archivo")
		return
	}

	const data = await res.json()

	if (!data.url) {
		alert("Error: No se pudo obtener la URL del archivo")
		return
	}

	const link = document.createElement("a")
	link.href = data.url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
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
