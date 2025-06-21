"use client"

import { Eye, Trash2, Upload, File, FileText, ImageIcon } from "lucide-react"
import { useController, type Control } from "react-hook-form"

import { cn, formatBytes, getFileExtension } from "@/lib/utils"
import { useFileManager } from "@/shared/hooks/useFileManager"

import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type { FileSchema } from "@/shared/schemas/file.schema"
import type { FieldValues, Path } from "react-hook-form"

interface FileTableProps<T extends FieldValues> {
	name: Path<T>
	label?: string
	className?: string
	control: Control<T>
	isMultiple?: boolean
	maxFileSize?: number
	acceptedFileTypes?: RegExp
	onUpload?: (files: FileSchema[]) => void
}

export default function FileTable<T extends FieldValues>({
	name,
	label,
	control,
	className,
	onUpload,
	maxFileSize = 10,
	isMultiple = true,
	acceptedFileTypes,
}: FileTableProps<T>) {
	const { field } = useController({
		name,
		control,
	})

	const { files, isDragging, dragEvents, handleFileChange, removeFile, removeAllFiles } =
		useFileManager({
			maxFileSize,
			isMultiple,
			acceptedFileTypes,
			initialFiles: field.value || [],
			onFilesChange: (newFiles) => {
				field.onChange(newFiles)
				onUpload?.(newFiles)
			},
		})

	const renderPreviewDialog = (url: string, fileType?: string) => {
		const isImage =
			fileType?.startsWith("image/") || url.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)$/i)
		const isPDF = fileType === "application/pdf" || url.match(/\.pdf$/i)

		return (
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Vista Previa</DialogTitle>
					<DialogDescription>Vista previa del archivo</DialogDescription>
				</DialogHeader>

				<div className="max-h-[80vh] overflow-auto">
					{isImage ? (
						<div className="relative h-[40vh] w-full">
							<div
								className="absolute inset-0 bg-contain bg-center bg-no-repeat"
								style={{ backgroundImage: `url(${url})` }}
								role="img"
								aria-label="Image preview"
							/>
						</div>
					) : isPDF ? (
						<div className="flex w-full max-w-4xl flex-col items-center">
							<iframe src={url} className="h-[80vh] w-full" title="PDF Viewer" />
						</div>
					) : (
						<div className="flex h-40 items-center justify-center">
							<p className="text-muted-foreground text-center">Vista previa no disponible</p>
						</div>
					)}
				</div>
			</DialogContent>
		)
	}

	return (
		<div className={cn("space-y-4", className)}>
			{(files.length === 0 || isMultiple) && (
				<div className="mb-3 flex items-center justify-between">
					{label && <p className="text-sm font-semibold">{label}</p>}

					<div className="group relative cursor-pointer">
						<Button className="flex gap-2 bg-emerald-600/10 text-emerald-600 transition-all group-hover:scale-105 group-hover:text-emerald-700">
							<Upload className="h-4 w-4" />
							<span>{files.length === 0 ? "Subir archivo" : "Subir más archivos"}</span>
						</Button>
						<input
							type="file"
							id={`${name}-add`}
							multiple={isMultiple}
							disabled={!isMultiple && files.length > 0}
							onChange={(e) => handleFileChange(e.target.files)}
							className="absolute inset-0 cursor-pointer opacity-0"
						/>
					</div>
				</div>
			)}

			{files.length > 0 ? (
				<>
					<div
						className={cn("rounded-md border border-dashed border-gray-300", {
							"border-none": files.length > 0,
						})}
					>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[30%]">Nombre</TableHead>
									<TableHead className="w-[30%]">Tipo</TableHead>
									<TableHead className="w-[20%]">Tamaño</TableHead>
									<TableHead className="w-[20%] text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{files.map((file, index) => (
									<TableRow key={index}>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												<span>
													{file.type?.startsWith("image/") ? (
														<ImageIcon className="h-5 w-5 text-yellow-500" />
													) : file.type === "application/pdf" ? (
														<FileText className="h-5 w-5 text-red-500" />
													) : (
														<File className="h-5 w-5 text-blue-500" />
													)}
												</span>
												<span className="max-w-[200px] truncate" title={file.title}>
													{file.title}
												</span>
											</div>
										</TableCell>
										<TableCell>{getFileExtension(file.url || "")}</TableCell>
										<TableCell>{formatBytes(file.fileSize)}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end">
												<Dialog>
													<DialogTrigger asChild>
														<Button
															size="icon"
															type="button"
															variant="ghost"
															onClick={() => {}}
															disabled={!file.preview && !file.url}
														>
															<Eye className="h-4 w-4" />
														</Button>
													</DialogTrigger>
													{(file.preview || file.url) &&
														renderPreviewDialog(file.preview || file.url, file.type)}
												</Dialog>
												<Button
													size="icon"
													type="button"
													variant="ghost"
													onClick={() => removeFile(index)}
													className="text-red-500 hover:bg-red-500 hover:text-white"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{files.length > 0 && (
						<div className="flex items-center justify-between">
							<p className="text-muted-foreground text-sm">
								{files.length}{" "}
								{files.length === 1 ? "archivo seleccionado" : "archivos seleccionados"}
							</p>
							<Button
								variant="ghost"
								className="text-red-500 hover:bg-red-500 hover:text-white"
								size="sm"
								onClick={removeAllFiles}
							>
								<Trash2 className="mr-1.5 h-3.5 w-3.5" />
								Eliminar todos
							</Button>
						</div>
					)}
				</>
			) : (
				<div
					className={cn(
						"bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed p-10 transition-all",
						{ "border-teal-500 bg-teal-400/10": isDragging }
					)}
					{...dragEvents}
				>
					<Upload className="text-muted-foreground mb-4 h-10 w-10" />
					<h3 className="text-lg font-medium">Arrastra y suelta archivos aquí</h3>
					<p className="text-muted-foreground mb-4 text-sm">O navega entre tus archivos</p>

					<div className="relative">
						<input
							id={name}
							type="file"
							multiple={isMultiple}
							className="absolute inset-0 cursor-pointer opacity-0"
							onChange={(e) => handleFileChange(e.target.files)}
						/>
					</div>

					<p className="text-muted-foreground mt-2 text-xs">
						PDF, DOCX, XLSX, PPTX (MAX. {maxFileSize}MB)
					</p>
				</div>
			)}
		</div>
	)
}
