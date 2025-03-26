import InternalUserForm from "@/components/forms/admin/user/InternalUserForm"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import BackButton from "@/components/shared/BackButton"

export default function CreateInternalUserPage() {
	return (
		<Card className="w-full max-w-screen-lg">
			<CardHeader>
				<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
					<BackButton href="/admin/dashboard/usuarios" />
					<h1 className="w-fit text-2xl font-bold">Nuevos Usuario OTC</h1>
				</div>
			</CardHeader>

			<CardContent>
				<InternalUserForm />
			</CardContent>
		</Card>
	)
}
