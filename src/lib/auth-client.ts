import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "./auth"

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
})
