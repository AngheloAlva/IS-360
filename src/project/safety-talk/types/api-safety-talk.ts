export interface ApiSafetyTalk {
  id: string
  category: string
  status: string
  score: number | null
  completedAt: string | null
  expiresAt: string | null
  currentAttempts: number
  user: {
    id: string
    name: string
    email: string
    company: {
      id: string
      name: string
    }
  }
}
