"use server"

import { z } from "zod"
import prisma from "@/lib/prisma"
import { WorkerDocumentType } from "@prisma/client"

const createWorkerDocumentSchema = z.object({
  userId: z.string(),
  workerId: z.string(),
  documentType: z.string(),
  documentName: z.string(),
  url: z.string(),
  expirationDate: z.date(),
})

export type CreateWorkerDocumentInput = z.infer<typeof createWorkerDocumentSchema>

export async function createWorkerDocument(input: CreateWorkerDocumentInput) {
  const { userId, workerId, documentType, documentName, url, expirationDate } = createWorkerDocumentSchema.parse(input)

  // Get the worker folder to verify it exists and get the company ID
  const workerFolder = await prisma.workerFolder.findFirst({
    where: { workerId },
    select: { 
      id: true,
      worker: {
        select: {
          id: true,
          companyId: true,
        },
      },
    },
  })

  if (!workerFolder) {
    throw new Error("Worker folder not found")
  }

  // Verify user belongs to the company
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.companyId !== workerFolder.worker.companyId) {
    throw new Error("Unauthorized - User does not belong to this company")
  }

  return await prisma.workerDocument.create({
    data: {
      type: documentType as WorkerDocumentType,
      name: documentName,
      url,
      category: "PERSONNEL",
      uploadedById: userId,
      folderId: workerFolder.id,
      expirationDate,
    },
  })
}
