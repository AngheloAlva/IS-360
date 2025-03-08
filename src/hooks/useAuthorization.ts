import { USER_ROLES } from "@/lib/consts/user-roles"
import type { Session } from "@/lib/auth"

export function useAuthorization(session: Session) {
	const isAdmin =
		session.user.role === USER_ROLES.ADMIN || session.user.role === USER_ROLES.SUPERADMIN

	const isUser = session.user.role === USER_ROLES.USER

	return {
		isAdmin,
		isUser,
		canAccessAdminRoutes: isAdmin,
		canAccessUserRoutes: true,
	}
}
