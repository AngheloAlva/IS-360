import { NextResponse, type NextRequest } from "next/server"
import { betterFetch } from "@better-fetch/fetch"

import type { auth } from "@/lib/auth"

type Session = typeof auth.$Infer.Session

export default async function authMiddleware(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith("/_next") || request.nextUrl.pathname.includes("/api/")) {
		return NextResponse.next()
	}

	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: {
			cookie: request.headers.get("cookie") || "",
		},
	})

	if (!session) {
		return NextResponse.redirect(new URL("/auth/login", request.url))
	}

	// Proteger rutas de administrador
	if (
		request.nextUrl.pathname.startsWith("/admin/dashboard") ||
		request.nextUrl.pathname.startsWith("/dashboard/documentacion")
	) {
		if (session.user.accessRole === "PARTNER_COMPANY" || session.user.accessRole === "SUPERVISOR") {
			return NextResponse.redirect(new URL("/dashboard/permiso-de-trabajo", request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/admin/dashboard/:path*", "/dashboard/:path*"],
}
