import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const workOrderId = searchParams.get("workOrderId")
    const folderId = searchParams.get("folderId")

    // Al menos uno de los dos parámetros debe estar presente
    if (!workOrderId && !folderId) {
      return new NextResponse("Either work order ID or folder ID is required", { status: 400 })
    }

    // Construir el where según los parámetros proporcionados
    const where: Record<string, string> = {}
    if (workOrderId) where.workOrderId = workOrderId
    if (folderId) where.id = folderId

    // Obtenemos la carpeta de arranque para la orden de trabajo
    const workOrderStartupFolder = await prisma.workOrderStartupFolder.findFirst({
      where,
      include: {
        workOrder: {
          select: {
            id: true,
            otNumber: true,
            type: true,
            workName: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        workers: {
          orderBy: {
            name: 'asc',
          },
        },
        vehicles: {
          orderBy: {
            name: 'asc',
          },
        },
        procedures: {
          orderBy: {
            name: 'asc',
          },
        },
        environmentals: {
          orderBy: {
            name: 'asc',
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
      },
    })

    // Si no existe la carpeta, devolvemos error
    if (!workOrderStartupFolder) {
      return new NextResponse("Work Order startup folder not found", { status: 404 })
    }

    return NextResponse.json(workOrderStartupFolder)
  } catch (error) {
    console.error("[WORK_ORDER_STARTUP_FOLDER_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
