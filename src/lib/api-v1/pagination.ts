const DEFAULT_LIMIT = 100
const MAX_LIMIT = 500

export function parsePaginationParams(searchParams: URLSearchParams) {
  const cursor = searchParams.get("cursor") ?? undefined
  const rawLimit = parseInt(searchParams.get("limit") ?? "", 10)
  const limit = Number.isNaN(rawLimit)
    ? DEFAULT_LIMIT
    : Math.min(Math.max(rawLimit, 1), MAX_LIMIT)

  const updatedSinceRaw = searchParams.get("updatedSince")
  const updatedSince = updatedSinceRaw ? new Date(updatedSinceRaw) : undefined
  const validUpdatedSince =
    updatedSince && !isNaN(updatedSince.getTime()) ? updatedSince : undefined

  return { cursor, limit, updatedSince: validUpdatedSince }
}
