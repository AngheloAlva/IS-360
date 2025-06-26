"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { SAFETY_TALK_STATUS } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { SubmitSafetyTalkAttemptSchema } from "../schemas/attempt.schema"
import { scoreEnvironmentalAnswers } from "../utils/environmental-questions"

export async function submitSafetyTalkAttempt(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    throw new Error("No autorizado")
  }

  const { category, answers } = SubmitSafetyTalkAttemptSchema.parse(data)

  // Get or create user safety talk record
  const existingAttempt = await prisma.userSafetyTalk.findFirst({
    where: {
      userId: session.user.id,
      category,
      status: SAFETY_TALK_STATUS.IN_PROGRESS,
    },
  })

  if (existingAttempt) {
    throw new Error("Ya tienes un intento en progreso")
  }

  // Check if user has a recent failed attempt
  const lastAttempt = await prisma.userSafetyTalk.findFirst({
    where: {
      userId: session.user.id,
      category,
      status: SAFETY_TALK_STATUS.FAILED,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (lastAttempt?.nextAttemptAt && lastAttempt.nextAttemptAt > new Date()) {
    throw new Error(
      `Debes esperar hasta ${lastAttempt.nextAttemptAt.toLocaleString()} para volver a intentar`
    )
  }

  // Create new attempt
  const result = await prisma.userSafetyTalk.create({
    data: {
      userId: session.user.id,
      category,
      status: SAFETY_TALK_STATUS.IN_PROGRESS,
      currentAttempts: (lastAttempt?.currentAttempts ?? 0) + 1,
      lastAttemptAt: new Date(),
    },
  })

  // Calculate score
  const score = scoreEnvironmentalAnswers(answers)

  // Update attempt with results
  if (result.status === SAFETY_TALK_STATUS.IN_PROGRESS) {
    const passed = score >= result.minRequiredScore
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Default 1 year expiration

    const nextAttemptDelay = !passed ? Math.pow(2, result.currentAttempts) * 24 * 60 * 60 * 1000 : null // hours to ms
    const nextAttemptAt = nextAttemptDelay ? new Date(Date.now() + nextAttemptDelay) : null

    await prisma.userSafetyTalk.update({
      where: { id: result.id },
      data: {
        score,
        status: passed ? SAFETY_TALK_STATUS.PASSED : SAFETY_TALK_STATUS.FAILED,
        completedAt: new Date(),
        expiresAt: passed ? expiresAt : null,
        nextAttemptAt,
      },
    })
  }

  revalidatePath("/dashboard/charlas-de-seguridad")
  return { success: true, attempt: result }
}
