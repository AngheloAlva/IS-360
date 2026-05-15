import { NextResponse, type NextRequest } from "next/server"

import { canAccessAdminRoute, getBestRedirectRoute } from "@/lib/module-permissions"

import type { auth } from "@/lib/auth"
import { MODULES } from "./generated/prisma/enums"

type Session = typeof auth.$Infer.Session

export default async function authMiddleware(request: NextRequest) {
	const requestId = crypto.randomUUID()

	const requestHeaders = new Headers(request.headers)
	requestHeaders.set("x-request-id", requestId)

	if (request.nextUrl.pathname.startsWith("/_next") || request.nextUrl.pathname.includes("/api/")) {
		return NextResponse.next({ request: { headers: requestHeaders } })
	}

	const session: Session = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
		headers: {
			cookie: request.headers.get("cookie") || "",
		},
	}).then((res) => res.json())

	if (!session) {
		const callbackUrl = request.nextUrl.pathname + request.nextUrl.search
		return NextResponse.redirect(
			new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
		)
	}

	if (!session.user.isActive) {
		return NextResponse.redirect(new URL("/"))
	}

	if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
		if (session.user.accessRole === "PARTNER_COMPANY") {
			return NextResponse.redirect(new URL("/dashboard/inicio", request.url))
		}

		if (session.user.accessRole === "ADMIN") {
			const userModules = (session.user.allowedModules as (MODULES | string)[]) || ["ALL"]

			if (!canAccessAdminRoute(userModules, request.nextUrl.pathname)) {
				// En lugar de redirigir siempre a inicio, usar redirección inteligente
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
