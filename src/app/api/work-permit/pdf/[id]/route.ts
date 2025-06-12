import { NextRequest, NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"

import prisma from "@/lib/prisma"

import WorkPermitPDF from "@/components/pdf/work-permit/WorkPermitPDF"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params

		const workPermit = await prisma.workPermit.findUnique({
			where: {
				id,
			},
			include: {
				otNumber: {
					include: {
						supervisor: {
							select: {
								name: true,
								rut: true,
							},
						},
					},
				},
				user: true,
				company: true,
				participants: true,
			},
		})

		if (!workPermit) {
			return NextResponse.json({ error: "Permiso de trabajo no encontrado" }, { status: 404 })
		}

		const pdfStream = await renderToStream(WorkPermitPDF({ workPermit }))

		const chunks: Buffer[] = []
		for await (const chunk of pdfStream) {
			const buffer =
				typeof chunk === "string"
					? Buffer.from(chunk)
					: Buffer.isBuffer(chunk)
						? chunk
						: Buffer.from(chunk as Uint8Array)
			chunks.push(buffer)
		}
		const pdfBuffer = Buffer.concat(chunks)

		const fileName = `permiso-trabajo-${workPermit.otNumber.otNumber}.pdf`

		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${fileName}"`,
			},
		})
	} catch (error) {
		console.error("Error generando el PDF:", error)
		return NextResponse.json({ error: "Error generando el PDF" }, { status: 500 })
	}
}
