import { type NextRequest, NextResponse } from "next/server"

import { visitorDataSchema } from "@/project/safety-talk/schemas/external-company.schema"
import { updateVisitorData } from "@/project/safety-talk/actions/updateVisitorData"

type Params = {
	token: string
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
	try {
		const { token } = params
		const body = await request.json()

		if (!token) {
			return NextResponse.json(
				{
					ok: false,
					message: "Token es requerido",
				},
				{ status: 400 }
			)
		}

		const validationResult = visitorDataSchema.safeParse(body.visitorData)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					ok: false,
					message: "Datos inválidos",
					errors: validationResult.error.errors,
				},
				{ status: 400 }
			)
		}

		if (!body.email) {
			return NextResponse.json(
				{
					ok: false,
					message: "Email es requerido",
				},
				{ status: 400 }
			)
		}

		const result = await updateVisitorData({
			token,
			email: body.email,
			visitorData: validationResult.data,
		})

		if (!result.ok) {
			return NextResponse.json(result, { status: 400 })
		}

		return NextResponse.json(result, { status: 200 })
	} catch (error) {
		console.error("Error in POST /api/visitor-talks/[token]/visitor:", error)
		return NextResponse.json(
			{
				ok: false,
				message: "Error interno del servidor",
			},
			{ status: 500 }
		)
	}
}
