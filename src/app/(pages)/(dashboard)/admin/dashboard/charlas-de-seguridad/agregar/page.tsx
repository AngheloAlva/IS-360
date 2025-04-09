import CreateSafetyTalkForm from "@/components/forms/admin/safety-talk/CreateSafetyTalkForm"
import BackButton from "@/components/shared/BackButton"

export default function CreateSafetyTalkPage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
				<BackButton href="/admin/dashboard/charlas-de-seguridad" />
				<h1 className="w-fit text-3xl font-bold">Nueva Charla de Seguridad</h1>
			</div>

			<CreateSafetyTalkForm />
		</>
	)
}
