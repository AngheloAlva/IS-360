import { USER_ROLES_VALUES } from "@/lib/consts/user-roles"
import type { Session } from "@/lib/auth"

export function useAuthorization(session: Session) {
	const isAdmin =
		session.user.role === USER_ROLES_VALUES.ADMIN ||
		session.user.role === USER_ROLES_VALUES.SUPERADMIN

	const isUser = session.user.role === USER_ROLES_VALUES.USER

	return {
		isAdmin,
		isUser,
		canAccessAdminRoutes: isAdmin,
		canAccessUserRoutes: isUser,
	}
}
