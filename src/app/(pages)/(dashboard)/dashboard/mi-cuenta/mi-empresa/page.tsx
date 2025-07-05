import { unauthorized } from "next/navigation"
import { BuildingIcon } from "lucide-react"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { MyCompany } from "@/project/auth/components/forms/MyCompany"
import { Separator } from "@/shared/components/ui/separator"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

export default async function CambiarContrasenaPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		unauthorized()
	}

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-row items-start justify-between gap-2">
				<div className="space-y-1">
					<CardTitle>Empresa</CardTitle>
					<CardDescription>
						Edita tus datos de la empresa para que sean actualizados en la plataforma.
					</CardDescription>
				</div>
				<BuildingIcon className="size-10 min-w-10 rounded-md bg-amber-500/10 p-1 text-amber-500" />
			</CardHeader>

			<Separator className="my-2" />

			<CardContent>
				<MyCompany user={session.user} companyId={session.user.companyId || ""} />
			</CardContent>
		</Card>
	)
}
