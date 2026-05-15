import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { normalizeRut } from "@/project/safety-talk/utils/normalize-rut"
import { inPersonSafetyTalkSchema } from "@/project/safety-talk/schemas/in-person-safety-talk.schema"

const validateSession = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { error: "No autorizado", status: 401 }
	}

	return { session }
}

export async function GET(request: NextRequest) {
	const { error, status, session } = await validateSession()

	if (error || !session) {
		return NextResponse.json({ error }, { status })
	}

	try {
		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get("page") || "1", 10)
		const limit = parseInt(searchParams.get("limit") || "10", 10)
		const search = searchParams.get("search") || ""
		const sortBy = searchParams.get("sortBy") || "createdAt"
		const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

		const where = search
			? {
					OR: [
						{ name: { contains: search, mode: "insensitive" as const } },
						{ rut: { contains: search, mode: "insensitive" as const } },
						{ company: { contains: search, mode: "insensitive" as const } },
					],
				}
			: {}

		const [records, totalRecords] = await Promise.all([
			prisma.inPersonSafetyTalkRecord.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { [sortBy]: sortOrder },
			}),
			prisma.inPersonSafetyTalkRecord.count({ where }),
		])

		const totalPages = Math.ceil(totalRecords / limit)

		// Map records to match the expected shape from the OrphanedSafetyTalksTable
		const mappedRecords = records.map((record) => ({
			id: record.id,
			rut: record.rut,
			name: record.name,
			company: record.company,
			category: record.category,
			fecha: record.sessionDate.toISOString(),
			vencimiento: record.expiresAt?.toISOString() ?? null,
			estado: record.status === "PASSED" ? "Vigente" : "No Vigente",
			status: record.status,
			score: record.score,
			source: record.source,
			notes: record.notes,
			createdAt: record.createdAt.toISOString(),
			updatedAt: record.updatedAt.toISOString(),
		}))

		return NextResponse.json({
			metadata: {
				generatedAt: new Date().toISOString(),
				totalRecords,
				filteredRecords: totalRecords,
				currentPage: page,
				totalPages,
				limit,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
				description: "Registros de charlas de seguridad presenciales (contratistas y visitas)",
			},
			records: mappedRecords,
		})
	} catch (error) {
		console.error("[GET_ORPHANED_RECORDS]", error)
		return NextResponse.json({ error: "Error al leer los registros" }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	const { error, status, session } = await validateSession()

	if (error || !session) {
		return NextResponse.json({ error }, { status })
	}

	try {
		const body = await request.json()
		const parsed = inPersonSafetyTalkSchema.safeParse(body)

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
				{ status: 400 }
			)
		}

		const { rut, name, company, category, sessionDate, expiresAt, score, notes, status: recordStatus } = parsed.data

		const record = await prisma.inPersonSafetyTalkRecord.create({
			data: {
				rut: normalizeRut(rut),
				name,
				company,
				category,
				sessionDate,
				expiresAt: expiresAt ?? new Date(sessionDate.getTime() + 365 * 24 * 60 * 60 * 1000),
				score,
				notes,
				status: recordStatus,
				source: "MANUAL",
				registeredById: session.user.id,
			},
		})

		return NextResponse.json(record, { status: 201 })
	} catch (error) {
		console.error("[POST_ORPHANED_RECORDS]", error)
		return NextResponse.json({ error: "Error al crear el registro" }, { status: 500 })
	}
}
