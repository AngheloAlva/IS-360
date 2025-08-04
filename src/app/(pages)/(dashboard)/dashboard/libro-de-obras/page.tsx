import { unauthorized } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import { WorkBookTable } from "@/project/work-order/components/data/WorkBookTable"
import NewWorkBookForm from "@/project/work-order/components/forms/NewWorkBookForm"
import ModuleHeader from "@/shared/components/ModuleHeader"
import VideoTutorials from "@/shared/components/VideoTutorials"

export default async function WorkBooksPage() {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res || !res.user || !res.user.companyId) {
		return unauthorized()
	}

	return (
		<main className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<ModuleHeader
				className="from-orange-600 to-red-700"
				title="Libro de Obras"
				description="Gestión de libros de obras de tu empresa"
			>
				<>
					<VideoTutorials
						videos={[
							{
								title: "Creacion Libro de Obras",
								description: "Tutorial de como crear un libro de obras.",
								url: "https://youtube.com/embed/FW-NFkb4300",
							},
							{
								title: "Creacion de Carta Gantt/Hitos",
								description: "Tutorial de como agregar un correctamente hitos.",
								url: "https://youtube.com/embed/ySMKy29aFYk",
							},
							{
								title: "Agregar Actividades Diarias",
								description: "Tutorial de como agregar un actividades diarias al libro de obras.",
								url: "https://youtube.com/embed/i1nqut1kOas",
							},
							{
								title: "Cierre de Hitos",
								description: "Tutorial de como cerrar un hito en el libro de obras.",
								url: "https://youtube.com/embed/snastGIP1Pw",
							},
							{
								title: "Respuesta a Inspección de OTC",
								description: "Tutorial de como cerrar un hito en el libro de obras.",
								url: "https://youtube.com/embed/WCUYcNFr7OI",
							},
						]}
					/>
					<NewWorkBookForm userId={res.user.id} companyId={res.user.companyId} />
				</>
			</ModuleHeader>

			<WorkBookTable companyId={res.user.companyId} />
		</main>
	)
}
