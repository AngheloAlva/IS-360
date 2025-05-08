import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // Temporalmente sin verificación de autenticación
    const companyId = req.nextUrl.searchParams.get("companyId")

    // Obtenemos las carpetas de arranque generales
    const generalStartupFolders = await prisma.generalStartupFolder.findMany({
      where: {
        // Si el usuario es partner company, solo devolvemos las carpetas de su empresa
        ...(companyId ? { companyId } : {}),
      },
      include: {
        company: {
          select: {
            name: true,
            rut: true,
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
        documents: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            documents: true,
          }
        }
      },
      orderBy: {
        companyId: 'asc',
      },
    })

    return NextResponse.json(generalStartupFolders)
  } catch (error) {
    console.error("[GENERAL_STARTUP_FOLDERS_LIST_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
