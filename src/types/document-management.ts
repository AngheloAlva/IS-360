export type FileType = "folder" | "document" | "image" | "video" | "audio" | "other"

export interface FileItem {
	id: string
	name: string
	type: FileType
	size?: number
	createdAt: Date
	updatedAt: Date
	path: string
}

export interface FolderItem extends FileItem {
	type: "folder"
	itemCount?: number
}
