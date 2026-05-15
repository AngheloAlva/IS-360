import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		return NextResponse.json({
			id: session.user.id,
			role: session.user.role,
			name: session.user.name,
			email: session.user.email,
			companyId: session.user.companyId,
		})
	} catch (error) {
		console.error("[USER_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
