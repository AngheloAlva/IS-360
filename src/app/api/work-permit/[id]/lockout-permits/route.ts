import { NextRequest, NextResponse } from "next/server"

import { getScopedWorkPermitId } from "@/project/work-permit/utils/authorization"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: req.headers,
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const { id } = await params
		const scopedWorkPermitId = await getScopedWorkPermitId({
			workPermitId: id,
			userId: session.user.id,
		})

		if (!scopedWorkPermitId) {
			return new NextResponse("No encontrado", { status: 404 })
		}

		const lockoutPermits = await prisma.lockoutPermit.findMany({
			where: {
				workPermitId: scopedWorkPermitId,
			},
			select: {
				id: true,
				status: true,
				lockoutType: true,
				lockoutTypeOther: true,
				startDate: true,
				endDate: true,
				activitiesToExecute: true,
				finalObservations: true,
				approved: true,
				approvalDate: true,
				approvalNotes: true,
				areaResponsible: {
					select: {
						id: true,
						name: true,
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
					select: {
						id: true,
						order: true,
						name: true,
						rut: true,
						contractorId: true,
						contractorLockNumber: true,
						contractorInstallDate: true,
						contractorInstallTime: true,
						contractorRemoveDate: true,
						contractorRemoveTime: true,
						internalLockNumber: true,
						internalOperatorId: true,
						internalOperator: {
							select: {
								id: true,
								name: true,
							},
						},
						internalInstallDate: true,
						internalInstallTime: true,
						internalRemoveDate: true,
						internalRemoveTime: true,
					},
					orderBy: {
						order: "asc",
					},
				},
				zeroEnergyReviews: {
					include: {
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
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		})

		return NextResponse.json({ lockoutPermits })
	} catch (error) {
		console.error("[WORK_PERMIT_LOCKOUT_PERMITS_GET]", error)
		return NextResponse.json({ error: "Error fetching lockout permits" }, { status: 500 })
	}
}
