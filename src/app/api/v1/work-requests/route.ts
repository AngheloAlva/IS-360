import { NextRequest } from "next/server"
import { validateApiKey } from "@/lib/api-key"
import { parsePaginationParams } from "@/lib/api-v1/pagination"
import { buildPaginatedResponse, errorResponse } from "@/lib/api-v1/response"
import { workRequestSelect, flattenWorkRequest } from "@/lib/api-v1/mappers/work-request"
import db from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth.valid) {
    return errorResponse(auth.error, "UNAUTHORIZED", auth.status)
  }

  try {
    const { cursor, limit, updatedSince } = parsePaginationParams(request.nextUrl.searchParams)

    const where = updatedSince ? { updatedAt: { gte: updatedSince } } : {}

    const [records, total] = await Promise.all([
      db.workRequest.findMany({
        where,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { id: "asc" },
        select: workRequestSelect,
      }),
      db.workRequest.count({ where }),
    ])

    const hasMore = records.length > limit
    const data = hasMore ? records.slice(0, limit) : records

    return buildPaginatedResponse({
      data: data.map(flattenWorkRequest),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
      limit,
      total,
    })
  } catch (error) {
    console.error("[API_V1_WORK_REQUESTS]", error)
    return errorResponse("Internal server error", "INTERNAL_ERROR", 500)
  }
}
