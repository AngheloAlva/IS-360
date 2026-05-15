import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
	Tailwind,
} from "@react-email/components"

interface NewSupportTicketEmailProps {
	ticketNumber: string
	title: string
	requesterName: string
	requesterEmail: string
	companyName?: string | null
	priority: string
	type: string
	affectedModule?: string | null
	description: string
}

export const NewSupportTicketEmail = ({
	ticketNumber,
	title,
	requesterName,
	requesterEmail,
	companyName,
	priority,
	type,
	affectedModule,
	description,
}: NewSupportTicketEmailProps) => (
	<Html>
		<Tailwind>
			<Head />
			<Preview>Nuevo ticket de soporte {ticketNumber}</Preview>
			<Body className="bg-slate-100 py-10 font-sans">
				<Container className="mx-auto max-w-[620px] rounded-xl bg-white p-8">
					<Heading className="m-0 text-2xl font-bold text-slate-800">
						Nuevo ticket de soporte
					</Heading>
					<Text className="mt-2 mb-6 text-sm text-slate-600">
						Se creo un nuevo ticket y requiere revision del equipo.
					</Text>

					<Section className="mb-5 rounded-lg border border-slate-200 p-4">
						<Text className="m-0 text-sm text-slate-500">Ticket</Text>
						<Text className="m-0 mt-1 text-base font-semibold text-slate-900">
							{ticketNumber} - {title}
						</Text>
					</Section>

					<Section className="mb-4 rounded-lg border border-slate-200 p-4">
						<Text className="m-0 text-sm text-slate-500">Solicitante</Text>
						<Text className="m-0 mt-1 text-sm text-slate-800">{requesterName}</Text>
						<Text className="m-0 text-sm text-slate-800">{requesterEmail}</Text>
						<Text className="m-0 text-sm text-slate-800">
							Empresa: {companyName || "Sin empresa asociada"}
						</Text>
					</Section>

					<Section className="mb-4 rounded-lg border border-slate-200 p-4">
						<Text className="m-0 text-sm text-slate-500">Detalle</Text>
						<Text className="m-0 mt-1 text-sm text-slate-800">Tipo: {type}</Text>
						<Text className="m-0 text-sm text-slate-800">Prioridad: {priority}</Text>
						<Text className="m-0 text-sm text-slate-800">
							Modulo afectado: {affectedModule || "No especificado"}
						</Text>
						<Text className="m-0 mt-2 text-sm text-slate-800">{description}</Text>
					</Section>

					<Hr className="my-4 border-slate-200" />
					<Text className="m-0 text-xs text-slate-500">OTC 360 - notificacion automatica</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
