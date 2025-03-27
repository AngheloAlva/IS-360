import { USER_ROLES } from "@/lib/consts/user-roles"
import { OTC_INTERNAL_ROLES } from "@/lib/consts/internal-roles"

export interface ApiUser {
  id: string
  name: string
  email: string
  rut: string
  role: keyof typeof USER_ROLES
  internalRole: keyof typeof OTC_INTERNAL_ROLES
  area: string | null
  createdAt: string
  isSupervisor: boolean
  company: {
    name: string
  } | null
}
