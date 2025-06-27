"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getSafetyTalkHistory() {
  const session = await auth.api.getSession({
    headers: new Headers({
      "content-type": "application/json",
    }),
  })

  if (!session?.user) {
    throw new Error("No autorizado")
  }

  const history = await prisma.userSafetyTalk.findMany({
    where: {
      status: {
        in: ["MANUALLY_APPROVED", "FAILED", "BLOCKED"]
      },
    },
    select: {
      id: true,
      category: true,
      status: true,
      score: true,
      completedAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      approvalBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  })

  return history
}
