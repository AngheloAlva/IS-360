import { unauthorized } from "next/navigation"
import { UserLockIcon } from "lucide-react"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { ProfileForm } from "@/project/auth/components/forms/ProfileForm"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"

export default async function DatosPersonalesPage(): Promise<React.ReactElement> {
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
					<CardTitle className="text-lg font-bold">Datos Personales</CardTitle>
					<CardDescription>
						Edita tus datos personales para que sean actualizados en la plataforma.
					</CardDescription>
				</div>
				<UserLockIcon className="bg-primary/10 text-primary size-10 min-w-10 rounded-md p-1" />
			</CardHeader>

			<Separator className="my-2" />

			<CardContent>
				<ProfileForm user={session.user} />
			</CardContent>
		</Card>
	)
}
