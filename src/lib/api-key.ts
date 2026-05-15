import { createHash, randomBytes } from "crypto"
import db from "@/lib/prisma"

type ApiKeyValidationResult =
  | { valid: true; apiKey: { id: string; name: string } }
  | { valid: false; error: string; status: 401 | 403 }

export async function validateApiKey(request: Request): Promise<ApiKeyValidationResult> {
  const apiKeyHeader = request.headers.get("x-api-key")

  if (!apiKeyHeader) {
    return { valid: false, error: "API key is required", status: 401 }
  }

  const keyHash = createHash("sha256").update(apiKeyHeader).digest("hex")

  const apiKey = await db.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, name: true, isActive: true, expiresAt: true },
  })

  if (!apiKey) {
    return { valid: false, error: "Invalid API key", status: 401 }
  }

  if (!apiKey.isActive) {
    return { valid: false, error: "API key revoked", status: 401 }
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: "API key has expired", status: 401 }
  }

  // Fire-and-forget: update lastUsedAt + increment counter
  db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
  }).catch(() => {})

  return { valid: true, apiKey: { id: apiKey.id, name: apiKey.name } }
}

export async function generateApiKey(opts: {
  name: string
  createdById: string
  expiresInDays?: number
}) {
  const rawBytes = randomBytes(32)
  const hexKey = rawBytes.toString("hex")
  const plainTextKey = `is_pk_${hexKey}`
  const keyHash = createHash("sha256").update(plainTextKey).digest("hex")
  const keyPrefix = `is_pk_${hexKey.slice(0, 8)}`

  const expiresAt = opts.expiresInDays
    ? new Date(Date.now() + opts.expiresInDays * 24 * 60 * 60 * 1000)
    : null

  const apiKey = await db.apiKey.create({
    data: {
      name: opts.name,
      keyHash,
      keyPrefix,
      createdById: opts.createdById,
      expiresAt,
    },
  })

  return { plainTextKey, apiKey }
}
