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

interface SupportTicketNoteEmailProps {
	recipientName: string
	commenterName: string
	ticketNumber: string
	title: string
	noteContent: string
	hasAttachments: boolean
	url: string
}

export const SupportTicketNoteEmail = ({
	recipientName,
	commenterName,
	ticketNumber,
	title,
	noteContent,
	hasAttachments,
	url,
}: SupportTicketNoteEmailProps) => (
	<Html>
		<Tailwind>
			<Head />
			<Preview>Nueva observacion en ticket {ticketNumber}</Preview>
			<Body className="bg-slate-100 py-10 font-sans">
				<Container className="mx-auto max-w-[620px] rounded-xl bg-white p-8">
					<Heading className="m-0 text-2xl font-bold text-slate-800">
						Nueva observacion en ticket
					</Heading>
					<Text className="mt-2 mb-5 text-sm text-slate-600">Hola {recipientName},</Text>

					<Section className="mb-4 rounded-lg border border-slate-200 p-4">
						<Text className="m-0 text-sm text-slate-500">Ticket</Text>
						<Text className="m-0 mt-1 text-base font-semibold text-slate-900">
							{ticketNumber} - {title}
						</Text>
						<Text className="m-0 mt-2 text-sm text-slate-500">Comentado por</Text>
						<Text className="m-0 mt-1 text-sm font-medium text-slate-800">
							{commenterName}
						</Text>
					</Section>

					<Section className="mb-4 rounded-lg border border-slate-200 p-4">
						<Text className="m-0 text-sm text-slate-500">Observacion</Text>
						<Text className="m-0 mt-1 text-sm text-slate-800">{noteContent}</Text>
						{hasAttachments ? (
							<Text className="m-0 mt-2 text-xs text-slate-500">
								Se adjuntaron archivos a esta observacion.
							</Text>
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
					<Text className="m-0 text-xs text-slate-500">OTC 360 - notificacion automatica</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
