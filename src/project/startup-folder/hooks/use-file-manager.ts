import { addYears } from "date-fns"
import { useState } from "react"

import type {
	BasicDocumentType,
	WorkerDocumentType,
	EnvironmentDocType,
	VehicleDocumentType,
	EnvironmentalDocType,
	TechSpecsDocumentType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

export type ManagedFile = { file: File } & {
	documentType?: string
	documentName?: string
	expirationDate?: Date
}

export interface FileManager {
	file: ManagedFile | null
	removeFile: () => void
	addFiles: (newFiles: File | null) => void
}

export function useFileManager(
	initialFile: ManagedFile | null,
	documentType?: {
		type:
			| BasicDocumentType
			| WorkerDocumentType
			| EnvironmentDocType
			| VehicleDocumentType
			| EnvironmentalDocType
			| TechSpecsDocumentType
			| SafetyAndHealthDocumentType
		name: string
	} | null,
	onFilesChange?: (files: ManagedFile | null) => void
): FileManager {
	const [file, setFiles] = useState<ManagedFile | null>(initialFile)

	const addFiles = (newFile: File | null) => {
		if (!newFile) return

		const managedFile: ManagedFile = { file: newFile }

		if (documentType || initialFile) {
			managedFile.documentType = documentType?.type || initialFile?.documentType || ""
			managedFile.documentName = documentType?.name || initialFile?.documentName || ""
		}
		managedFile.expirationDate = managedFile.expirationDate || addYears(new Date(), 1)

		setFiles(managedFile)
		onFilesChange?.(managedFile)
	}

	const removeFile = () => {
		setFiles(null)
		onFilesChange?.(null)
	}

	return {
		file,
		addFiles,
		removeFile,
	}
}
