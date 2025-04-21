import CreateEquipmentForm from "@/components/forms/admin/equipment/CreateEquipmentForm"
import BackButton from "@/components/shared/BackButton"

export default function CreateUserPage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
				<BackButton href="/admin/dashboard/equipos" />
				<h1 className="w-fit text-3xl font-bold">Nuevo Equipo</h1>
			</div>

			<CreateEquipmentForm />
		</>
	)
}
