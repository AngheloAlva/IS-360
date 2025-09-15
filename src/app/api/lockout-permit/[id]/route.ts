import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params

		if (!id) {
			return NextResponse.json({ error: "ID is required" }, { status: 400 })
		}

		const lockoutPermit = await prisma.lockoutPermit.findUnique({
			where: { id },
			include: {
				supervisor: {
					select: { id: true, name: true, rut: true },
				},
				operator: {
					select: { id: true, name: true, rut: true },
				},
				removeLockout: {
					select: { id: true, name: true, rut: true },
				},
				areaResponsible: {
					select: { id: true, name: true, rut: true },
				},
				requestedBy: {
					select: { id: true, name: true, rut: true },
				},
				company: {
					select: { id: true, name: true, rut: true },
				},
				otNumberRef: {
					select: {
						id: true,
						otNumber: true,
						workRequest: true,
						workDescription: true,
					},
				},
				equipments: {
					select: {
						id: true,
						name: true,
						tag: true,
					},
				},
				lockoutRegistrations: {
					orderBy: { order: "asc" },
					select: {
						id: true,
						order: true,
						name: true,
						rut: true,
						lockNumber: true,
						installDate: true,
						installTime: true,
						removeDate: true,
						removeTime: true,
					},
				},
				zeroEnergyReviews: {
					select: {
						id: true,
						location: true,
						action: true,
						reviewedZero: true,
						equipment: {
							select: {
								id: true,
								name: true,
								tag: true,
							},
						},
						performedBy: {
							select: {
								id: true,
								name: true,
								rut: true,
							},
						},
						reviewer: {
							select: {
								id: true,
								name: true,
								rut: true,
							},
						},
					},
				},
				attachments: {
					select: {
						id: true,
						name: true,
						url: true,
						createdAt: true,
					},
					orderBy: { createdAt: "desc" },
				},
			},
		})

		if (!lockoutPermit) {
			return NextResponse.json({ error: "Lockout permit not found" }, { status: 404 })
		}

		// Transform the data to match the expected interface
		const transformedLockoutPermit = {
			...lockoutPermit,
			// Convert dates to strings for JSON serialization
			startDate: lockoutPermit.startDate.toISOString(),
			endDate: lockoutPermit.endDate.toISOString(),
			approvalDate: lockoutPermit.approvalDate?.toISOString() || null,
			createdAt: lockoutPermit.createdAt.toISOString(),
			updatedAt: lockoutPermit.updatedAt.toISOString(),
			lockoutRegistrations: lockoutPermit.lockoutRegistrations.map((reg) => ({
				...reg,
				installDate: reg.installDate?.toISOString() || null,
				removeDate: reg.removeDate?.toISOString() || null,
				// Add signature fields that are missing from schema but expected in interface
				installSign: null,
				removeSign: null,
			})),
			zeroEnergyReviews: lockoutPermit.zeroEnergyReviews.map((review) => ({
				...review,
				// Add fields that are missing from schema but expected in interface
				performedByName: null,
				reviewerName: null,
				reviewerSign: null,
			})),
			attachments: lockoutPermit.attachments.map((att) => ({
				...att,
				createdAt: att.createdAt.toISOString(),
			})),
			// Add field that might be missing from schema but expected in interface
			supervisorName: null,
			operatorName: null,
		}

		return NextResponse.json(transformedLockoutPermit)
	} catch (error) {
		console.error("Error fetching lockout permit details:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
