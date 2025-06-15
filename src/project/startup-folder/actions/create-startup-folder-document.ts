"use server"

import { z } from "zod"
import prisma from "@/lib/prisma"
import { DocumentCategory, WorkerDocumentType, VehicleDocumentType, EnvironmentalDocType, SafetyAndHealthDocumentType } from "@prisma/client"

const createDocumentSchema = z.object({
  userId: z.string(),
  startupFolderId: z.string(),
  documentType: z.string(),
  documentName: z.string(),
  url: z.string(),
  category: z.nativeEnum(DocumentCategory),
  workerId: z.string().optional(),
  vehicleId: z.string().optional(),
  expirationDate: z.date(),
})

export type CreateStartupFolderDocumentInput = z.infer<typeof createDocumentSchema>

export async function createStartupFolderDocument(input: CreateStartupFolderDocumentInput) {
  const { userId, startupFolderId, documentType, documentName, url, category, workerId, vehicleId, expirationDate } = createDocumentSchema.parse(input)

  // Get the startup folder to verify it exists and get the company ID
  const startupFolder = await prisma.startupFolder.findUnique({
    where: { id: startupFolderId },
    select: { 
      id: true,
      companyId: true,
      workersFolders: workerId ? {
        where: { workerId },
        select: { id: true },
      } : undefined,
      vehiclesFolders: vehicleId ? {
        where: { vehicleId },
        select: { id: true },
      } : undefined,
      environmentalFolders: {
        select: { id: true },
      },
      safetyAndHealthFolders: {
        select: { id: true },
      },
    },
  })

  if (!startupFolder) {
    throw new Error("Startup folder not found")
  }

  // Verify user belongs to the company
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.companyId !== startupFolder.companyId) {
    throw new Error("Unauthorized - User does not belong to this company")
  }

  // Create document based on category
  switch (category) {
    case "PERSONNEL": {
      if (!workerId) {
        throw new Error("workerId is required for PERSONNEL documents")
      }
      const folder = startupFolder.workersFolders?.[0]
      if (!folder) {
        throw new Error("Worker folder not found for this worker in this startup folder")
      }

      return await prisma.workerDocument.create({
        data: {
          type: documentType as WorkerDocumentType,
          name: documentName,
          url,
          category,
          uploadedById: userId,
          folderId: folder.id,
          expirationDate,
        },
      })
    }

    case "VEHICLES": {
      if (!vehicleId) {
        throw new Error("vehicleId is required for VEHICLES documents")
      }
      const folder = startupFolder.vehiclesFolders?.[0]
      if (!folder) {
        throw new Error("Vehicle folder not found for this vehicle in this startup folder")
      }

      return await prisma.vehicleDocument.create({
        data: {
          type: documentType as VehicleDocumentType,
          name: documentName,
          url,
          category,
          uploadedById: userId,
          folderId: folder.id,
          expirationDate,
        },
      })
    }

    case "ENVIRONMENTAL": {
      const folder = startupFolder.environmentalFolders[0]
      if (!folder) {
        throw new Error("Environmental folder not found")
      }

      return await prisma.environmentalDocument.create({
        data: {
          type: documentType as EnvironmentalDocType,
          name: documentName,
          url,
          category,
          uploadedById: userId,
          folderId: folder.id,
          expirationDate,
        },
      })
    }

    case "SAFETY_AND_HEALTH": {
      const folder = startupFolder.safetyAndHealthFolders[0]
      if (!folder) {
        throw new Error("Safety and health folder not found")
      }

      return await prisma.safetyAndHealthDocument.create({
        data: {
          type: documentType as SafetyAndHealthDocumentType,
          name: documentName,
          url,
          category,
          uploadedById: userId,
          folderId: folder.id,
          expirationDate,
        },
      })
    }

    default:
      throw new Error(`Unsupported document category: ${category}`)
  }
}
