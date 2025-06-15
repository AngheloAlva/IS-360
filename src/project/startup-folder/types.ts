import { type ReviewStatus } from "@prisma/client"

export interface StartupFolderDocument {
  id: string
  name: string
  url: string | null
  status: ReviewStatus
  reviewNotes: string | null
  expirationDate: Date | null
  uploadedBy: {
    name: string
  } | null
}
