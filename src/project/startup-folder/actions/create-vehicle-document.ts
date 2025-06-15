"use server"

import { z } from "zod"
import prisma from "@/lib/prisma"
import { VehicleDocumentType } from "@prisma/client"

const createVehicleDocumentSchema = z.object({
  userId: z.string(),
  vehicleId: z.string(),
  documentType: z.string(),
  documentName: z.string(),
  url: z.string(),
  expirationDate: z.date(),
})

export type CreateVehicleDocumentInput = z.infer<typeof createVehicleDocumentSchema>

export async function createVehicleDocument(input: CreateVehicleDocumentInput) {
  const { userId, vehicleId, documentType, documentName, url, expirationDate } = createVehicleDocumentSchema.parse(input)

  // Get the vehicle folder to verify it exists and get the company ID
  const vehicleFolder = await prisma.vehicleFolder.findFirst({
    where: { vehicleId },
    select: { 
      id: true,
      vehicle: {
        select: {
          id: true,
          companyId: true,
        },
      },
    },
  })

  if (!vehicleFolder) {
    throw new Error("Vehicle folder not found")
  }

  // Verify user belongs to the company
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.companyId !== vehicleFolder.vehicle.companyId) {
    throw new Error("Unauthorized - User does not belong to this company")
  }

  return await prisma.vehicleDocument.create({
    data: {
      type: documentType as VehicleDocumentType,
      name: documentName,
      url,
      category: "VEHICLES",
      uploadedById: userId,
      folderId: vehicleFolder.id,
      expirationDate,
    },
  })
}
