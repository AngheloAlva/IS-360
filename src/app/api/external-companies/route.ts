import { type NextRequest, NextResponse } from "next/server"

import { externalCompanySchema } from "@/project/safety-talk/schemas/external-company.schema"
import { createExternalCompany } from "@/project/safety-talk/actions/createExternalCompany"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		// Validate the request body
		const validationResult = externalCompanySchema.safeParse(body)

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

		const { videoUrl, expiresAt } = body

		if (!videoUrl) {
			return NextResponse.json(
				{
					ok: false,
					message: "URL del video es requerida",
				},
				{ status: 400 }
			)
		}

		const result = await createExternalCompany({
			values: validationResult.data,
			videoUrl,
			expiresAt: expiresAt ? new Date(expiresAt) : undefined,
		})

		if (!result.ok) {
			return NextResponse.json(result, { status: 400 })
		}

		return NextResponse.json(result, { status: 201 })
	} catch (error) {
		console.error("Error in POST /api/external-companies:", error)
		return NextResponse.json(
			{
				ok: false,
				message: "Error interno del servidor",
			},
			{ status: 500 }
		)
	}
}
