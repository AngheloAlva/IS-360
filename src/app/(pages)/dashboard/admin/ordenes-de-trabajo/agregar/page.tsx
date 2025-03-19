import BackButton from "@/components/shared/BackButton"

export default function CreateUserPage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-lg items-center justify-start gap-2">
				<BackButton href="/dashboard/admin/ordenes-de-trabajo" />
				<h1 className="w-fit text-3xl font-bold">Nueva Orden de Trabajo</h1>
			</div>
		</>
	)
}
