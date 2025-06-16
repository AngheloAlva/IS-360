import { addYears } from "date-fns"
import { useState } from "react"

export type ManagedFile = File & {
	documentType?: string
	documentName?: string
	expirationDate?: Date
}

interface FileTypeUpdate {
	type: string
	name: string
	expirationDate: Date
}

export interface FileManager {
	files: ManagedFile[]
	removeFile: (index: number) => void
	addFiles: (newFiles: FileList | null) => void
	setFileType: (index: number, update: FileTypeUpdate) => void
}

export function useFileManager(initialFiles: ManagedFile[] = []): FileManager {
	const [files, setFiles] = useState<ManagedFile[]>(initialFiles)

	const addFiles = (newFiles: FileList | null) => {
		if (!newFiles) return

		setFiles((prev) => {
			const filesArray = Array.from(newFiles).map((file) =>
				Object.assign(file, {
					documentType: undefined,
					documentName: undefined,
					expirationDate: addYears(new Date(), 1),
				})
			)

			return [...prev, ...filesArray]
		})
	}

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index))
	}

	const setFileType = (index: number, { type, name, expirationDate }: FileTypeUpdate) => {
		setFiles((prev) => {
			const updated = [...prev]
			const file = updated[index]
			if (file) {
				file.documentType = type
				file.documentName = name
				file.expirationDate = expirationDate
			}
			return updated
		})
	}

	return {
		files,
		addFiles,
		removeFile,
		setFileType,
	}
}
