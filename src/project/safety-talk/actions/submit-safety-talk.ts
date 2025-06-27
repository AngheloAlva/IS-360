"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { scoreEnvironmentalAnswers } from "../utils/environmental-questions"
import { scoreIRLAnswers } from "../utils/irl-questions"

interface FormattedAnswer {
  questionId: number
  answer: string | string[]
}

export async function submitSafetyTalkAnswers(
  attemptId: string,
  category: "ENVIRONMENT" | "IRL",
  answers: FormattedAnswer[]
) {
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
    // Verificar que el intento existe y pertenece al usuario
    const attempt = await prisma.userSafetyTalk.findFirst({
      where: {
        id: attemptId,
        userId: session.user.id,
        status: "IN_PROGRESS",
      },
    })

    if (!attempt) {
      return {
        ok: false,
        message: "Intento no encontrado o ya finalizado",
      }
    }

    // Calcular puntaje según la categoría
    // Convertir respuestas al formato esperado por las funciones de puntuación
    const formattedAnswersForScoring = answers.map(({ questionId, answer }) => ({
      questionId,
      answer: Array.isArray(answer) ? answer.join(",") : answer,
    }))

    const score =
      category === "ENVIRONMENT"
        ? scoreEnvironmentalAnswers(formattedAnswersForScoring)
        : scoreIRLAnswers(formattedAnswersForScoring)

    // Determinar si aprobó (puntaje mínimo es 70%)
    const passed = score >= attempt.minRequiredScore

    // Actualizar el intento
    const updatedAttempt = await prisma.userSafetyTalk.update({
      where: { id: attemptId },
      data: {
        status: passed ? "PASSED" : "FAILED",
        score,
        completedAt: new Date(),
        // Si falló, el próximo intento es en:
        // - 1er intento: 1 hora
        // - 2do intento: 24 horas
        // - 3er intento: 72 horas
        // - 4to o más: bloqueado (requiere aprobación manual)
        ...(passed
          ? {
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
            }
          : attempt.currentAttempts >= 3
          ? {
              status: "BLOCKED",
              nextAttemptAt: null,
            }
          : {
              nextAttemptAt: new Date(
                Date.now() +
                  (attempt.currentAttempts === 1
                    ? 60 * 60 * 1000 // 1 hora
                    : attempt.currentAttempts === 2
                    ? 24 * 60 * 60 * 1000 // 24 horas
                    : 72 * 60 * 60 * 1000) // 72 horas
              ),
            }),
      },
    })

    logActivity({
      userId: session.user.id,
      module: MODULES.SAFETY_TALK,
      action: ACTIVITY_TYPE.COMPLETE,
      entityId: updatedAttempt.id,
      entityType: "UserSafetyTalk",
      metadata: {
        category,
        score,
        passed,
        attempt: attempt.currentAttempts,
      },
    })

    revalidatePath("/dashboard/charlas-de-seguridad")

    return {
      ok: true,
      attempt: updatedAttempt,
    }
  } catch (error) {
    console.error("[SUBMIT_SAFETY_TALK]", error)
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error al enviar el examen",
    }
  }
}
