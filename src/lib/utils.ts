import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const getFileExtension = (fileName: string) => {
	return fileName.split(".").pop()?.toUpperCase() || ""
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return "0 Bytes"
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export const formatRut = (value: string): string => {
	if (value.length === 0) return ""

	let cleanValue = value.replace(/[^0-9kK]+/g, "")

	cleanValue = cleanValue.slice(0, 9)

	if (cleanValue.length > 1) {
		cleanValue = `${cleanValue.slice(0, -1)}-${cleanValue.slice(-1)}`
	}

	const parts = cleanValue.split("-")
	let numberPart = parts[0]
	numberPart = numberPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

	if (parts.length === 1) return numberPart
	return `${numberPart}-${parts[1]}`
}

export const formatDate = (date: Date | string | null) => {
	if (!date) return "-"

	return new Date(date).toLocaleDateString("es-CL", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	})
}
