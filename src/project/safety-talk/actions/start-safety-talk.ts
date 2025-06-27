"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, SAFETY_TALK_CATEGORY } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function startSafetyTalk(category: SAFETY_TALK_CATEGORY) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return {
      ok: false,
      message: "No autorizado",
    }
  }

  try {
    // Verificar si hay un intento en progreso
    const existingAttempt = await prisma.userSafetyTalk.findFirst({
      where: {
        userId: session.user.id,
        category,
        status: "IN_PROGRESS",
      },
    })

    if (existingAttempt) {
      // Si el intento existe y no ha expirado, retornarlo
      if (existingAttempt.nextAttemptAt && new Date(existingAttempt.nextAttemptAt) > new Date()) {
        return {
          ok: true,
          attempt: existingAttempt,
        }
      }

      // Si el intento ha expirado, actualizarlo a fallido
      await prisma.userSafetyTalk.update({
        where: { id: existingAttempt.id },
        data: {
          status: "FAILED",
          score: 0,
        },
      })
    }

    // Crear nuevo intento
    const now = new Date()
    const userSafetyTalk = await prisma.userSafetyTalk.create({
      data: {
        userId: session.user.id,
        category,
        status: "IN_PROGRESS",
        currentAttempts: (existingAttempt?.currentAttempts ?? 0) + 1,
        startedAt: now,
        lastAttemptAt: now,
        // El tiempo límite es 30 minutos
        nextAttemptAt: new Date(now.getTime() + 30 * 60 * 1000),
      },
    })

    logActivity({
      userId: session.user.id,
      module: MODULES.SAFETY_TALK,
      action: ACTIVITY_TYPE.CREATE,
      entityId: userSafetyTalk.id,
      entityType: "UserSafetyTalk",
      metadata: {
        category,
        status: "IN_PROGRESS",
      },
    })

    revalidatePath("/dashboard/charlas-de-seguridad")

    return {
      ok: true,
      attempt: userSafetyTalk,
    }
  } catch (error) {
    console.error("[START_SAFETY_TALK]", error)
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error al iniciar la charla",
    }
  }
}
