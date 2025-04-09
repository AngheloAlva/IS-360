import { NextResponse, type NextRequest } from "next/server"
import { betterFetch } from "@better-fetch/fetch"

import type { auth } from "@/lib/auth"

type Session = typeof auth.$Infer.Session

export default async function authMiddleware(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith("/_next")) {
		return NextResponse.next()
	}

	// Configurar headers para conexiones persistentes en rutas API
	if (request.nextUrl.pathname.includes("/api/")) {
		const response = NextResponse.next()
		response.headers.set("Connection", "keep-alive")
		response.headers.set("Keep-Alive", "timeout=5, max=1000")
		return response
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
	if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
		if (session.user.role === "PARTNER_COMPANY") {
			return NextResponse.redirect(new URL("/dashboard/permiso-de-trabajo", request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/admin/dashboard/:path*", "/dashboard/:path*"],
}
