import { Prisma } from "@/generated/prisma/client"

const inPersonSafetyTalkSelect = {
  id: true,
  rut: true,
  name: true,
  company: true,
  category: true,
  sessionDate: true,
  expiresAt: true,
  status: true,
  score: true,
  source: true,
  notes: true,
  registeredById: true,
  registeredBy: { select: { name: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.InPersonSafetyTalkRecordSelect

export type InPersonSafetyTalkRow = Prisma.InPersonSafetyTalkRecordGetPayload<{
  select: typeof inPersonSafetyTalkSelect
}>

export { inPersonSafetyTalkSelect }

export function flattenInPersonSafetyTalk(row: InPersonSafetyTalkRow) {
  return {
    id: row.id,
    rut: row.rut,
    name: row.name,
    company: row.company,
    category: row.category,
    sessionDate: row.sessionDate.toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
    status: row.status,
    score: row.score,
    source: row.source,
    notes: row.notes,
    registeredById: row.registeredById,
    registeredByName: row.registeredBy?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
