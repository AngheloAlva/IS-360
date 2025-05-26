import { adminClient, inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "./auth"
import {
	ac,
	admin,
	user,
	partnerCompany,
	regulatoryCompliance,
	integrityAndMaintenance,
	qualityAndOperationalExcellence,
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
				partnerCompany,
				regulatoryCompliance,
				integrityAndMaintenance,
				qualityAndOperationalExcellence,
			},
		}),
		inferAdditionalFields<typeof auth>(),
		twoFactorClient(),
	],
})
