export type PaginationInfo = {
  nextCursor: string | null
  hasMore: boolean
  limit: number
}

export type MetaInfo = {
  total: number
  generatedAt: string
}

export type ApiResponse<T> = {
  data: T[]
  pagination: PaginationInfo
  meta: MetaInfo
}

export type ErrorResponse = {
  error: string
  code: string
}
