import { NextResponse } from "next/server"

export function buildPaginatedResponse<T>(opts: {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
  limit: number
  total: number
}) {
  return NextResponse.json({
    data: opts.data,
    pagination: {
      nextCursor: opts.nextCursor,
      hasMore: opts.hasMore,
      limit: opts.limit,
    },
    meta: {
      total: opts.total,
      generatedAt: new Date().toISOString(),
    },
  })
}

export function errorResponse(error: string, code: string, status: number) {
  return NextResponse.json({ error, code }, { status })
}
