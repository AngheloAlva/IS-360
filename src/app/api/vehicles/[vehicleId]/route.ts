import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ vehicleId: string }> }
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user?.companyId) {
			return NextResponse.json(
				{
					message: "No tienes permisos para ver este vehículo",
				},
				{
					status: 401,
				}
			)
		}

		const { vehicleId } = await params

		const vehicle = await prisma.vehicle.findFirst({
			where: {
				id: vehicleId,
				companyId: session.user.companyId,
			},
			select: {
				id: true,
				plate: true,
				model: true,
				year: true,
				brand: true,
				type: true,
				color: true,
				isMain: true,
				createdAt: true,
				updatedAt: true,
				vehiclesFolders: {
					select: {
						id: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						startupFolderId: true,
					},
					orderBy: {
						createdAt: "desc",
					},
				},
			},
		})

		if (!vehicle) {
			return NextResponse.json(
				{
					message: "Vehículo no encontrado",
				},
				{
					status: 404,
				}
			)
		}

		return NextResponse.json(vehicle)
	} catch (error) {
		console.error("Error al obtener vehículo:", error)
		return NextResponse.json(
			{
				message: "Error al obtener vehículo",
			},
			{
				status: 500,
			}
		)
	}
}
