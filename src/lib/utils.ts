import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatBytes(bytes: number) {
	const units = ["B", "KB", "MB", "GB"]
	let size = bytes
	let unitIndex = 0

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024
		unitIndex++
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`
}

export const getFileExtension = (fileName: string) => {
	return fileName.split(".").pop()?.toUpperCase() || ""
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
