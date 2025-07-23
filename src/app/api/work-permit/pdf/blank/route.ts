import { renderToBuffer } from "@react-pdf/renderer"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import React from "react"

import { auth } from "@/lib/auth"

import BlankWorkPermitPDF from "@/project/work-permit/components/pdf/BlankWorkPermitPDF"

export async function GET(): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const pdfBuffer = await renderToBuffer(React.createElement(BlankWorkPermitPDF))

		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="permiso-trabajo-vacio.pdf"`,
			},
		})
	} catch (error) {
		console.error("Error generando PDF vacío:", error)
		return NextResponse.json({ error: "Error generando PDF vacío" }, { status: 500 })
	}
}
