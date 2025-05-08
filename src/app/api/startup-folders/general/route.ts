import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const companyId = searchParams.get("companyId")
    const folderId = searchParams.get("folderId")

    // Al menos uno de los dos parámetros debe estar presente
    if (!companyId && !folderId) {
      return new NextResponse("Either company ID or folder ID is required", { status: 400 })
    }

    // Construir el where según los parámetros proporcionados
    const where: {
      companyId?: string;
      id?: string;
    } = {}
    if (companyId) where.companyId = companyId
    if (folderId) where.id = folderId

    // Obtenemos la carpeta de arranque general
    const generalStartupFolder = await prisma.generalStartupFolder.findFirst({
      where,
      include: {
        company: {
          select: {
            name: true,
            rut: true,
          },
        },
        documents: {
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
    if (!generalStartupFolder) {
      return new NextResponse("General startup folder not found", { status: 404 })
    }

    return NextResponse.json(generalStartupFolder)
  } catch (error) {
    console.error("[GENERAL_STARTUP_FOLDER_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
