"use client"

import { useFieldArray, type Control } from "react-hook-form"
import { UploadCloud, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { FileCard } from "@/components/ui/file-card"
import { Button } from "@/components/ui/button"

import type { ArrayPath, FieldValues } from "react-hook-form"

interface UploadFilesFieldProps<T extends FieldValues> {
	className?: string
	name: ArrayPath<T>
	control: Control<T>
	isMultiple?: boolean
	canPreview?: boolean
	maxFileSize?: number
	labelClassName?: string
	acceptedFileTypes?: RegExp
	containerClassName?: string
	selectedFileIndex: number | null
	setSelectedFileIndex: (index: number | null) => void
}

export default function UploadFilesFormField<T extends FieldValues>({
	name,
	control,
	className,
	labelClassName,
	maxFileSize = 10,
	canPreview = true,
	isMultiple = true,
	acceptedFileTypes,
	selectedFileIndex,
	containerClassName,
	setSelectedFileIndex,
}: UploadFilesFieldProps<T>) {
	const [isDragging, setIsDragging] = useState(false)

	const { fields, append, remove } = useFieldArray({
		control,
		name,
	})

	const handleFileChange = async (files: FileList | null) => {
		if (!files) return

		for (const file of Array.from(files)) {
			if (acceptedFileTypes) {
				if (!acceptedFileTypes.test(file.name)) {
					toast.error(`Formato no soportado: ${file.name}`, {
						description: `Solo se permiten archivos ${acceptedFileTypes.toString().replaceAll(",", ", ")}`,
					})
					continue
				}
			}

			if (file.size > maxFileSize * 1024 * 1024) {
				toast.error(`Archivo demasiado grande: ${file.name}`, {
					description: `El tamaño máximo permitido es ${maxFileSize}MB`,
				})
				continue
			}

			if (!isMultiple && fields.length > 0) {
				remove(0)
			}

			const preview = URL.createObjectURL(file)

			append({
				file,
				url: "",
				preview,
				type: file.type,
				title: file.name,
				fileSize: file.size,
				mimeType: file.type,
			} as T[ArrayPath<T>])
		}
	}

	return (
		<div className={cn("grid gap-4", containerClassName)}>
			<div className="flex w-full items-center justify-center">
				<label
					htmlFor={`${name}`}
					className={cn(
						"flex h-96 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-500/10 transition-colors hover:bg-gray-100/20",
						{
							"border-purple-500 bg-purple-400/10": isDragging,
							"border-green-500/50 bg-green-500/10": fields.length > 0,
						},
						labelClassName
					)}
					onDragOver={(e) => {
						e.preventDefault()
						e.stopPropagation()
						setIsDragging(true)
					}}
					onDragEnter={(e) => {
						e.preventDefault()
						e.stopPropagation()
						setIsDragging(true)
					}}
					onDragLeave={(e) => {
						e.preventDefault()
						e.stopPropagation()
						setIsDragging(false)
					}}
					onDrop={(e) => {
						e.preventDefault()
						e.stopPropagation()
						setIsDragging(false)
						handleFileChange(e.dataTransfer.files)
					}}
				>
					<div className="flex flex-col items-center justify-center pt-5 pb-6">
						<UploadCloud
							className={cn("mb-3 h-10 w-10 text-gray-400", {
								"text-purple-500": isDragging,
								"text-green-500": fields.length > 0,
							})}
						/>
						{fields.length === 0 ? (
							<p className="mb-2 text-sm text-gray-500">
								<span className="font-semibold">Click para subir</span> o arrastra y suelta
							</p>
						) : (
							<>
								<p className="mb-2 font-bold text-green-500">
									{fields.length} {fields.length === 1 ? "archivo" : "archivos"} seleccionados
								</p>
								{isMultiple ? (
									<p className="mb-2 text-sm text-gray-500">
										<span className="font-semibold">Click para subir más</span> o arrastra y suelta
									</p>
								) : (
									<p className="mb-2 text-sm text-gray-500">
										<span className="font-semibold text-red-500">Elimina el archivo actual</span>{" "}
										para subir otro
									</p>
								)}
							</>
						)}
						<p className="text-xs text-gray-500">PDF, DOCX, PPTX (MAX. {maxFileSize}MB)</p>
					</div>
					<input
						id={name}
						type="file"
						className="hidden"
						multiple={isMultiple}
						disabled={!isMultiple && fields.length > 0}
						onChange={(e) => handleFileChange(e.target.files)}
					/>
				</label>
			</div>

			{fields.length > 0 && (
				<Button
					type="button"
					className="border border-red-500 bg-red-500/10 text-red-600 transition-colors group-hover:visible hover:bg-red-500/50"
					onClick={() => remove()}
				>
					<X className="h-4 w-4" />
					Eliminar todos los archivos
				</Button>
			)}

			<div className={cn("grid grid-cols-2 gap-4 xl:grid-cols-3", className)}>
				{fields.length > 0 && (
					<h3 className="col-span-2 text-lg font-semibold xl:col-span-3">Archivos Seleccionados</h3>
				)}
				{fields.map((field, index: number) => (
					<div key={field.id} className="group relative">
						<FileCard
							file={field as T[ArrayPath<T>]}
							isSelected={selectedFileIndex === index}
							onClick={() => {
								setSelectedFileIndex(index)
							}}
							canPreview={canPreview}
						/>
						<Button
							size="icon"
							type="button"
							className="invisible absolute top-3 right-3 h-7 w-7 rounded-full bg-red-500/10 text-red-600 transition-colors group-hover:visible hover:bg-red-500/50"
							onClick={() => {
								remove(index)
								if (selectedFileIndex === index) {
									setSelectedFileIndex(index > 0 ? index - 1 : null)
								}
							}}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>
		</div>
	)
}
