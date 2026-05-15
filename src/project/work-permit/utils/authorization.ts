import { getAllowedCompanyIds } from "@/shared/actions/users/get-allowed-companies"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function hasWorkPermitUpdatePermission(userId: string): Promise<boolean> {
	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId,
			permissions: {
				workPermit: ["update"],
			},
		},
	})

	return hasPermission.success
}

export async function getScopedWorkPermitId({
	workPermitId,
	userId,
}: {
	workPermitId: string
	userId: string
}): Promise<string | null> {
	const userAllowedCompanies = await getAllowedCompanyIds(userId)

	const workPermit = await prisma.workPermit.findFirst({
		where: {
			id: workPermitId,
			...(userAllowedCompanies.length ? { companyId: { in: userAllowedCompanies } } : {}),
		},
		select: {
			id: true,
		},
	})

	return workPermit?.id ?? null
}
