import { Prisma } from "@/generated/prisma/client"

const safetyTalkSelect = {
  id: true,
  category: true,
  status: true,
  currentAttempts: true,
  score: true,
  minRequiredScore: true,
  completedAt: true,
  expiresAt: true,
  manuallyApproved: true,
  inPersonSessionDate: true,
  userId: true,
  user: { select: { name: true } },
  approvalById: true,
  approvalBy: { select: { name: true } },
  _count: { select: { attempts: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSafetyTalkSelect

export type SafetyTalkRow = Prisma.UserSafetyTalkGetPayload<{
  select: typeof safetyTalkSelect
}>

export { safetyTalkSelect }

export function flattenSafetyTalk(row: SafetyTalkRow) {
  return {
    id: row.id,
    category: row.category,
    status: row.status,
    currentAttempts: row.currentAttempts,
    score: row.score,
    minRequiredScore: row.minRequiredScore,
    completedAt: row.completedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    manuallyApproved: row.manuallyApproved,
    inPersonSessionDate: row.inPersonSessionDate?.toISOString() ?? null,
    userId: row.userId,
    userName: row.user.name,
    approvalById: row.approvalById,
    approvalByName: row.approvalBy?.name ?? null,
    attemptCount: row._count.attempts,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
