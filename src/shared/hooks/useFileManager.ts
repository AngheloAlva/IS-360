import { useState } from "react"
import { toast } from "sonner"

import type { FileSchema } from "@/shared/schemas/file.schema"

interface UseFileManagerProps {
	maxFileSize?: number
	isMultiple?: boolean
	acceptedFileTypes?: RegExp
	initialFiles?: FileSchema[]
	onFilesChange?: (files: FileSchema[]) => void
}

export function useFileManager({
	maxFileSize = 10,
	isMultiple = true,
	initialFiles = [],
	acceptedFileTypes,
	onFilesChange,
}: UseFileManagerProps = {}) {
	const [files, setFiles] = useState<FileSchema[]>(initialFiles)
	const [isDragging, setIsDragging] = useState(false)

	const handleFileChange = async (newFiles: FileList | null) => {
		if (!newFiles) return

		const updatedFiles = [...files]
		let filesChanged = false

		for (const file of Array.from(newFiles)) {
			if (acceptedFileTypes && !acceptedFileTypes.test(file.name)) {
				toast.error(`Formato no soportado: ${file.name}`, {
					description: `Solo se permiten archivos ${acceptedFileTypes.toString().replaceAll(",", ", ")}`,
				})
				continue
			}

			if (file.size > maxFileSize * 1024 * 1024) {
				toast.error(`Archivo demasiado grande: ${file.name}`, {
					description: `El tamaño máximo permitido es ${maxFileSize}MB`,
				})
				continue
			}

			if (!isMultiple && files.length > 0) {
				updatedFiles.splice(0, updatedFiles.length)
			}

			const preview = URL.createObjectURL(file)

			updatedFiles.push({
				file,
				url: "",
				preview,
				type: file.type,
				title: file.name,
				fileSize: file.size,
				mimeType: file.type,
			})

			filesChanged = true
		}

		if (filesChanged) {
			setFiles(updatedFiles)
			onFilesChange?.(updatedFiles)
		}
	}

	const removeFile = (index: number) => {
		const updatedFiles = [...files]
		updatedFiles.splice(index, 1)
		setFiles(updatedFiles)
		onFilesChange?.(updatedFiles)
	}

	const removeAllFiles = () => {
		setFiles([])
		onFilesChange?.([])
	}

	const dragEvents = {
		onDragOver: (e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragging(true)
		},
		onDragEnter: (e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragging(true)
		},
		onDragLeave: (e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragging(false)
		},
		onDrop: (e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragging(false)
			handleFileChange(e.dataTransfer.files)
		},
	}

	return {
		files,
		setFiles,
		isDragging,
		dragEvents,
		removeFile,
		removeAllFiles,
		handleFileChange,
	}
}
