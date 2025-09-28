import { addYears } from "date-fns"
import { useState } from "react"

import type {
	LABOR_CONTROL_DOCUMENT_TYPE,
	WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
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
		type: LABOR_CONTROL_DOCUMENT_TYPE | WORKER_LABOR_CONTROL_DOCUMENT_TYPE
		name: string
	} | null,
	onFilesChange?: (files: ManagedFile | null) => void
): FileManager {
	const [file, setFile] = useState<ManagedFile | null>(initialFile)

	const addFiles = (newFile: File | null) => {
		if (!newFile) return

		const managedFile: ManagedFile = { file: newFile }

		if (documentType || initialFile) {
			managedFile.documentType = documentType?.type || initialFile?.documentType || ""
			managedFile.documentName = documentType?.name || initialFile?.documentName || ""
		}
		managedFile.expirationDate = managedFile.expirationDate || addYears(new Date(), 1)

		setFile(managedFile)
		onFilesChange?.(managedFile)
	}

	const removeFile = () => {
		setFile(null)
		onFilesChange?.(null)
	}

	return {
		file,
		addFiles,
		removeFile,
	}
}
