import { NextResponse, type NextRequest } from "next/server"

import { canAccessAdminRoute, getBestRedirectRoute } from "@/lib/module-permissions"

import { DEMO_USERS } from "@/lib/demo-auth/users"
import { DEMO_ROLE_COOKIE } from "@/lib/demo-auth/storage"
import type { DemoRole } from "@/lib/demo-auth/types"
import { MODULES } from "./generated/prisma/enums"

function isDemoRole(value: string | undefined): value is DemoRole {
	return value === "admin" || value === "internal-tech" || value === "supervisor"
}

export default async function authMiddleware(request: NextRequest) {
	const requestId = crypto.randomUUID()

	const requestHeaders = new Headers(request.headers)
	requestHeaders.set("x-request-id", requestId)

	if (request.nextUrl.pathname.startsWith("/_next") || request.nextUrl.pathname.includes("/api/")) {
		return NextResponse.next({ request: { headers: requestHeaders } })
	}

	const roleCookie = request.cookies.get(DEMO_ROLE_COOKIE)?.value
	const role = isDemoRole(roleCookie) ? roleCookie : null
	const demoUser = role ? DEMO_USERS[role] : null

	if (!demoUser) {
		const callbackUrl = request.nextUrl.pathname + request.nextUrl.search
		return NextResponse.redirect(
			new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
		)
	}

	if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
		if (demoUser.accessRole === "PARTNER_COMPANY") {
			return NextResponse.redirect(new URL("/dashboard/inicio", request.url))
		}

		if (demoUser.accessRole === "ADMIN") {
			const userModules: (MODULES | string)[] = ["ALL"]

			if (!canAccessAdminRoute(userModules, request.nextUrl.pathname)) {
				const bestRoute = getBestRedirectRoute(userModules)
				return NextResponse.redirect(new URL(bestRoute, request.url))
			}
		}
	}

	return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
	matcher: ["/admin/dashboard/:path*", "/dashboard/:path*", "/api/:path*"],
}
