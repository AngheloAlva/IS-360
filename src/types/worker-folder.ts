import { ReviewStatus, User, WorkerDocument } from "@prisma/client"

export interface WorkerFolderWithDocuments {
  id: string
  status: ReviewStatus
  submittedAt: Date | null
  workerId: string
  worker: User // Usamos User en lugar de Worker
  documents: WorkerDocument[]
  startupFolderId: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkerWithDocuments extends Omit<User, 'password'> {
  folder: WorkerFolderWithDocuments | null
  documents: WorkerDocument[]
  uploadedDocumentsCount: number
  totalDocumentsCount: number
}
