import JSZip from "jszip"

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

export async function downloadMultipleDocumentsSecurely(
	filenames: string[],
	containerType: "documents" | "files" | "startup" | "avatars" | "equipment" = "documents",
	companyId?: string
): Promise<void> {
	try {
		const res = await fetch("/api/file", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				filenames,
				containerType,
				companyId,
				action: "read",
			}),
		})

		if (res.status === 403) {
			const errorData = await res.json()
			alert(`Acceso denegado: ${errorData.error || "Sin permisos para descargar algunos archivos"}`)
			return
		}

		if (!res.ok) {
			alert("Error al obtener URLs de descarga")
			return
		}

		const { urls } = await res.json()

		if (!urls || !Array.isArray(urls) || urls.length !== filenames.length) {
			throw new Error("Error al obtener URLs de descarga")
		}

		const zip = new JSZip()
		const folder = zip.folder("documentos")

		// Fetch all files and add to zip
		await Promise.all(
			urls.map(async (url: string, index: number) => {
				try {
					const fileResponse = await fetch(url)
					if (!fileResponse.ok) throw new Error(`Error downloading ${filenames[index]}`)
					const blob = await fileResponse.blob()
					folder?.file(filenames[index], blob)
				} catch (error) {
					console.error(`Failed to download ${filenames[index]}`, error)
					// Continue with other files even if one fails
				}
			})
		)

		// Generate zip and trigger download
		const content = await zip.generateAsync({ type: "blob" })
		const link = document.createElement("a")
		link.href = URL.createObjectURL(content)
		link.download = `documentos-${new Date().toISOString().split("T")[0]}.zip`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(link.href)
	} catch (error) {
		console.error("Error downloading multiple documents:", error)
		alert("Ocurrió un error al intentar descargar los archivos")
	}
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

interface Attachment {
	name: string
	url: string
}

export async function downloadAttachmentsAsZip(
	attachments: Attachment[],
	zipName?: string
): Promise<void> {
	if (attachments.length === 0) {
		throw new Error("No hay adjuntos para descargar")
	}

	// Extract filenames from Azure URLs and prepare for API call
	const filesToDownload = attachments
		.map((attachment) => {
			const filename = extractFilenameFromUrl(attachment.url)
			if (!filename) {
				console.error(`No se pudo extraer filename de URL: ${attachment.url}`)
				return null
			}
			return { filename, originalName: attachment.name }
		})
		.filter((item): item is { filename: string; originalName: string } => item !== null)

	if (filesToDownload.length === 0) {
		throw new Error("No se pudieron procesar los adjuntos")
	}

	try {
		// Call API to get SAS URLs for all files
		const res = await fetch("/api/file", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				filenames: filesToDownload.map((f) => f.filename),
				containerType: "files",
				action: "read",
			}),
		})

		if (res.status === 403) {
			const errorData = await res.json()
			throw new Error(
				`Acceso denegado: ${errorData.error || "Sin permisos para descargar algunos archivos"}`
			)
		}

		if (!res.ok) {
			throw new Error("Error al obtener URLs de descarga")
		}

		const { urls } = await res.json()

		if (!urls || !Array.isArray(urls) || urls.length === 0) {
			throw new Error("Error al obtener URLs de descarga")
		}

		const zip = new JSZip()
		const folder = zip.folder("adjuntos")

		// Download each file from SAS URL and add to zip
		await Promise.all(
			urls.map(async (sasUrl: string, index: number) => {
				try {
					const fileResponse = await fetch(sasUrl)
					if (!fileResponse.ok) {
						console.error(
							`Error downloading ${filesToDownload[index].originalName}: ${fileResponse.status}`
						)
						return
					}
					const blob = await fileResponse.blob()
					folder?.file(filesToDownload[index].originalName, blob)
				} catch (error) {
					console.error(`Failed to download ${filesToDownload[index].originalName}:`, error)
					// Continue with other files even if one fails
				}
			})
		)

		// Check if any files were added to the zip
		const zipFiles = Object.keys(folder?.files ?? {})
		if (zipFiles.length <= 1) {
			// Only the folder itself, no files added
			throw new Error("No se pudo descargar ningún adjunto")
		}

		// Generate zip and trigger download
		const content = await zip.generateAsync({ type: "blob" })
		const link = document.createElement("a")
		link.href = URL.createObjectURL(content)
		link.download = zipName || `adjuntos-${new Date().toISOString().split("T")[0]}.zip`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(link.href)
	} catch (error) {
		console.error("Error creating zip:", error)
		throw error
	}
}
