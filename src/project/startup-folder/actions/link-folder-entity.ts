"use server"

import prisma from "@/lib/prisma"
import { DocumentCategory } from "@prisma/client"

interface LinkFolderEntityParams {
  startupFolderId: string
  entityId: string
  category: DocumentCategory
}

export async function linkFolderEntity({
  startupFolderId,
  entityId,
  category,
}: LinkFolderEntityParams) {
  try {
    switch (category) {
      case "PERSONNEL":
        return await prisma.workerFolder.create({
          data: {
            workerId: entityId,
            startupFolderId,
            status: "DRAFT",
            additionalNotificationEmails: [],
          },
        })
      case "VEHICLES":
        return await prisma.vehicleFolder.create({
          data: {
            vehicleId: entityId,
            startupFolderId,
            status: "DRAFT",
            additionalNotificationEmails: [],
          },
        })
      default:
        throw new Error(`Cannot link entity for category: ${category}`)
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new Error("Esta entidad ya está vinculada a la carpeta de arranque")
    }
    console.error("Error linking folder entity:", error)
    throw new Error("No se pudo vincular la entidad a la carpeta de arranque")
  }
}
