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
	return NextResponse.next()
}

export const config = {
	matcher: "/dashboard/:path*",
}
