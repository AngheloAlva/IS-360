"use server"

import { z } from "zod"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

const deleteDocumentSchema = z.object({
  documentId: z.string(),
  category: z.nativeEnum(DocumentCategory),
})

export type DeleteStartupFolderDocumentInput = z.infer<typeof deleteDocumentSchema>

export async function deleteStartupFolderDocument({
  data,
  userId,
}: {
  data: DeleteStartupFolderDocumentInput
  userId: string
}) {
  const { documentId, category } = deleteDocumentSchema.parse(data)

  // Get the document to verify its status and ownership
  let document
  switch (category) {
    case "PERSONNEL":
      document = await prisma.workerDocument.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          status: true,
          uploadedById: true,
        },
      })
      break
    case "VEHICLES":
      document = await prisma.vehicleDocument.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          status: true,
          uploadedById: true,
        },
      })
      break
    case "ENVIRONMENTAL":
      document = await prisma.environmentalDocument.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          status: true,
          uploadedById: true,
        },
      })
      break
    case "SAFETY_AND_HEALTH":
      document = await prisma.safetyAndHealthDocument.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          status: true,
          uploadedById: true,
        },
      })
      break
    default:
      throw new Error(`Unsupported document category: ${category}`)
  }

  if (!document) {
    throw new Error("Document not found")
  }

  // Verify document ownership
  if (document.uploadedById !== userId) {
    throw new Error("Not authorized to delete this document")
  }

  // Only allow deletion of DRAFT documents
  if (document.status !== ReviewStatus.DRAFT) {
    throw new Error("Only documents in DRAFT status can be deleted")
  }

  // Delete the document
  switch (category) {
    case "PERSONNEL":
      await prisma.workerDocument.delete({
        where: { id: documentId },
      })
      break
    case "VEHICLES":
      await prisma.vehicleDocument.delete({
        where: { id: documentId },
      })
      break
    case "ENVIRONMENTAL":
      await prisma.environmentalDocument.delete({
        where: { id: documentId },
      })
      break
    case "SAFETY_AND_HEALTH":
      await prisma.safetyAndHealthDocument.delete({
        where: { id: documentId },
      })
      break
  }
}
