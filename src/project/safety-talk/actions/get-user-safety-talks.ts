"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"

export async function getUserSafetyTalks() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    return { ok: false, message: "No autorizado" }
  }

  try {
    const safetyTalks = await prisma.userSafetyTalk.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        attempts: {
          orderBy: {
            completedAt: "desc",
          },
          select: {
            id: true,
            score: true,
            completedAt: true,
          },
        },
        approvalBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { ok: true, safetyTalks }
  } catch (error) {
    console.error(error)
    return { ok: false, message: "Error al obtener las charlas" }
  }
}
