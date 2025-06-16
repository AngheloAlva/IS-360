import { addYears } from "date-fns"
import { useState } from "react"

import type {
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

export type ManagedFile = File & {
	documentType?: string
	documentName?: string
	expirationDate?: Date
}

export interface FileManager {
	files: ManagedFile[]
	removeFile: (index: number) => void
	addFiles: (newFiles: FileList | null) => void
}

export function useFileManager(
	initialFiles: ManagedFile[] = [],
	documentType?: {
		type:
			| WorkerDocumentType
			| VehicleDocumentType
			| EnvironmentalDocType
			| SafetyAndHealthDocumentType
		name: string
	} | null,
	onFilesChange?: (files: ManagedFile[]) => void
): FileManager {
	const [files, setFiles] = useState<ManagedFile[]>(initialFiles)

	const addFiles = (newFiles: FileList | null) => {
		if (!newFiles) return

		setFiles((prev) => {
			const filesArray = Array.from(newFiles).map((file) => {
				const managedFile = file as ManagedFile
				managedFile.documentType = documentType?.type || ""
				managedFile.expirationDate = addYears(new Date(), 1)
				managedFile.documentName = documentType?.name || file.name
				return managedFile
			})

			const updatedFiles = [...prev, ...filesArray]
			onFilesChange?.(updatedFiles)
			return updatedFiles
		})
	}

	const removeFile = (index: number) => {
		setFiles((prev) => {
			const newFiles = prev.filter((_, i) => i !== index)
			onFilesChange?.(newFiles)
			return newFiles
		})
	}

	return {
		files,
		addFiles,
		removeFile,
	}
}
