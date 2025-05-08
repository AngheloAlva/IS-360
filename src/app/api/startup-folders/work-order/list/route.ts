import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // Temporalmente sin verificación de autenticación
    const companyId = req.nextUrl.searchParams.get("companyId")

    // Obtenemos las carpetas de arranque de órdenes de trabajo
    const workOrderStartupFolders = await prisma.workOrderStartupFolder.findMany({
      where: {
        // Si el usuario es partner company, solo devolvemos las carpetas de las órdenes de su empresa
        ...(companyId ? {
          workOrder: {
            companyId
          }
        } : {}),
      },
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
              }
            }
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            workers: true,
            vehicles: true,
            procedures: true,
            environmentals: true,
          }
        }
      },
      orderBy: [
        {
          status: 'asc',
        },
        {
          createdAt: 'desc',
        }
      ],
    })

    return NextResponse.json(workOrderStartupFolders)
  } catch (error) {
    console.error("[WORK_ORDER_STARTUP_FOLDERS_LIST_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
