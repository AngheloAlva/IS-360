import {
	Hr,
	Img,
	Html,
	Text,
	Body,
	Head,
	Button,
	Section,
	Heading,
	Preview,
	Tailwind,
	Container,
} from "@react-email/components"

interface RequestCloseMilestoneEmailTemplateProps {
	milestone: {
		name: string
		weight: number
		description: string | null
		workOrderId: string
		workOrder: {
			otNumber: string
			workName: string | null
			workDescription: string | null
		}
	}
}

const systemUrl = "https://otc360.ingsimple.cl"

export const RequestCloseMilestoneEmailTemplate: React.FC<
	Readonly<RequestCloseMilestoneEmailTemplateProps>
> = ({ milestone }) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Solicitud de cierre de hito - OTC 360 - OTC</title>
				<Preview>
					Se ha solicitado el cierre del hito {milestone.name} de la orden de trabajo{" "}
					{milestone.workOrder.otNumber}
				</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px]">
					<Section className="mb-[32px] text-center">
						<Img
							width="150"
							height="142"
							alt="OTC 360 Logo"
							src={`${systemUrl}/logo.svg`}
							className="mx-auto h-auto w-[150px] object-cover"
						/>
					</Section>

					<Section>
						<Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-800">
							Se ha solicitado el cierre del hito
						</Heading>

						<Text className="mb-[16px] text-[16px] text-gray-600">Estimado usuario,</Text>

						<Text className="mb-[24px] text-[16px] text-gray-600">
							Ha recibido una solicitud de cierre de hito de la orden de trabajo{" "}
							<strong>{milestone.workOrder.otNumber}</strong>. Para completar el proceso de cierre,
							dirijase a la sección de hitos de la orden de trabajo y marque el hito como
							completado.
						</Text>

						<Section className="mb-[24px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px] text-center">
							<Text className="my-[8px] text-[32px] font-bold tracking-[5px] text-blue-600">
								{milestone.workOrder.otNumber}
							</Text>
						</Section>

						<Section className="mb-[32px] text-center">
							<Button
								href={systemUrl}
								className="box-input rounded-[4px] bg-blue-600 px-[24px] py-[12px] text-center font-bold text-white no-underline"
							>
								Ir al Sistema
							</Button>
						</Section>

						<Text className="mb-[8px] text-[16px] text-gray-600">Saludos cordiales,</Text>

						<Text className="mb-[24px] text-[16px] font-bold text-gray-700">
							El equipo de OTC 360
						</Text>
					</Section>

					<Hr className="my-[24px] border-t border-gray-300" />

					<Section>
						<Text className="m-0 text-center text-[14px] text-gray-500">
							© {new Date().getFullYear()} OTC 360. Todos los derechos reservados.
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
