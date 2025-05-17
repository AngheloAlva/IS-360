import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { VehicleDocumentType, ReviewStatus } from "@prisma/client"
import { VEHICLE_STRUCTURE } from "@/lib/consts/startup-folders-structure"

// Tipos de documentos de vehículo definidos en la estructura
const vehicleDocumentTypes = VEHICLE_STRUCTURE.documents.map(
  (doc) => doc.type
) as VehicleDocumentType[]

// Función para mapear el estado del documento
const getDocumentStatus = (isRequired: boolean): ReviewStatus => {
  return isRequired ? "DRAFT" : "DRAFT"
}

export async function POST() {
  try {
    // Obtener todas las empresas con sus vehículos y carpetas de inicio
    const companies = await prisma.company.findMany({
      include: {
        vehicles: true,
        generalStartupFolders: true,
      },
    })

    const results = []

    // Para cada empresa
    for (const company of companies) {
      // Para cada carpeta de inicio de la empresa
      for (const folder of company.generalStartupFolders) {
        // Para cada vehículo de la empresa
        for (const vehicle of company.vehicles) {
          // Verificar si ya existe una carpeta para este vehículo
          const existingFolder = await prisma.vehicleFolder.findFirst({
            where: {
              vehicleId: vehicle.id,
              startupFolderId: folder.id,
            },
          })

          if (!existingFolder) {
            // Crear la carpeta del vehículo
            const vehicleFolder = await prisma.vehicleFolder.create({
              data: {
                vehicle: {
                  connect: { id: vehicle.id },
                },
                startupFolder: {
                  connect: { id: folder.id },
                },
                status: 'DRAFT',
              },
            })

            // Crear los documentos para este vehículo
            const documentPromises = VEHICLE_STRUCTURE.documents.map(async (doc) => {
              // Verificar si ya existe este documento
              const existingDoc = await prisma.vehicleDocument.findFirst({
                where: {
                  vehicleFolderId: vehicleFolder.id,
                  type: doc.type as VehicleDocumentType,
                },
              })

              if (!existingDoc) {
                return prisma.vehicleDocument.create({
                  data: {
                    name: doc.name,
                    type: doc.type as VehicleDocumentType,
                    url: '',
                    fileType: 'application/pdf',
                    category: 'VEHICLES',
                    status: getDocumentStatus(doc.required),
                    uploadedAt: new Date(),
                    folder: {
                      connect: { id: folder.id },
                    },
                    vehicleFolder: {
                      connect: { id: vehicleFolder.id },
                    },
                  },
                })
              }
              return null
            })

            await Promise.all(documentPromises)

            results.push({
              company: company.name,
              vehicle: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
              folderId: folder.id,
              status: 'CREATED',
              documentsCreated: vehicleDocumentTypes.length,
            })
          } else {
            results.push({
              company: company.name,
              vehicle: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
              folderId: folder.id,
              status: 'ALREADY_EXISTS',
            })
          }
        }
      }
    }


    return NextResponse.json({
      message: 'Proceso de creación de carpetas de vehículos completado',
      results,
    })
  } catch (error) {
    console.error('Error en seed-vehicles-folders:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
