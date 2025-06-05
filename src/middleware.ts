import { NextResponse, type NextRequest } from "next/server"

import type { auth } from "@/lib/auth"

type Session = typeof auth.$Infer.Session

export default async function authMiddleware(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith("/_next") || request.nextUrl.pathname.includes("/api/")) {
		return NextResponse.next()
	}

	const session: Session = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
		headers: {
			cookie: request.headers.get("cookie") || "",
		},
	}).then((res) => res.json())

	if (!session) {
		return NextResponse.redirect(new URL("/auth/login", request.url))
	}

	// Proteger rutas de administrador
	if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
		if (session.user.accessRole === "PARTNER_COMPANY") {
			return NextResponse.redirect(new URL("/dashboard/inicio", request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/admin/dashboard/:path*", "/dashboard/:path*"],
}
