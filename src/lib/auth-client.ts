import { adminClient, inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "./auth"
import {
	ac,
	user,
	admin,
	operator,
	userOperator,
	partnerCompany,
	companyOperator,
	workBookOperator,
	workOrderOperator,
	equipmentOperator,
	workPermitOperator,
	safetyTalkOperator,
	documentationOperator,
	startupFolderOperator,
	maintenancePlanOperator,
} from "./permissions"

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	plugins: [
		adminClient({
			ac,
			roles: {
				admin,
				user,
				operator,
				userOperator,
				partnerCompany,
				companyOperator,
				workBookOperator,
				workOrderOperator,
				equipmentOperator,
				workPermitOperator,
				safetyTalkOperator,
				documentationOperator,
				startupFolderOperator,
				maintenancePlanOperator,
			},
		}),
		inferAdditionalFields<typeof auth>(),
		twoFactorClient(),
	],
})
