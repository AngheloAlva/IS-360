import {
	Body,
	Button,
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

interface SupportTicketStatusEmailProps {
	name: string
	ticketNumber: string
	title: string
	statusLabel: string
	note?: string
	url: string
}

export const SupportTicketStatusEmail = ({
	name,
	ticketNumber,
	title,
	statusLabel,
	note,
	url,
}: SupportTicketStatusEmailProps) => (
	<Html>
		<Tailwind>
			<Head />
			<Preview>Actualizacion de tu ticket {ticketNumber}</Preview>
			<Body className="bg-slate-100 py-10 font-sans">
				<Container className="mx-auto max-w-[620px] rounded-xl bg-white p-8">
					<Heading className="m-0 text-2xl font-bold text-slate-800">
						Actualizacion de soporte
					</Heading>
					<Text className="mt-2 mb-5 text-sm text-slate-600">Hola {name},</Text>

					<Section className="mb-4 rounded-lg border border-slate-200 p-4">
						<Text className="m-0 text-sm text-slate-500">Ticket</Text>
						<Text className="m-0 mt-1 text-base font-semibold text-slate-900">
							{ticketNumber} - {title}
						</Text>
						<Text className="m-0 mt-2 text-sm text-slate-800">Estado actual: {statusLabel}</Text>
						{note ? (
							<Text className="m-0 mt-2 text-sm text-slate-800">Observacion: {note}</Text>
						) : null}
					</Section>

					<Section className="mb-4 text-center">
						<Button
							href={url}
							className="box-border rounded-md bg-slate-900 px-5 py-3 text-sm text-white"
						>
							Ver ticket
						</Button>
					</Section>

					<Hr className="my-4 border-slate-200" />
					<Text className="m-0 text-xs text-slate-500">IS 360 - notificacion automatica</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
