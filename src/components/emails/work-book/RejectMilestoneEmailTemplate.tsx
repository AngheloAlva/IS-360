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

interface RejectMilestoneEmailTemplateProps {
	otNumber: string
	milestoneName: string
	comment?: string
}

const systemUrl = "https://otc360.ingsimple.cl"

export const RejectMilestoneEmailTemplate: React.FC<
	Readonly<RejectMilestoneEmailTemplateProps>
> = ({ comment, otNumber, milestoneName }) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Hito {otNumber} aprobado - OTC 360 - OTC</title>
				<Preview>
					El hito {milestoneName} de la orden de trabajo {otNumber} ha sido rechazado
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
						<Text className="mb-[16px] text-[16px] text-gray-600">Estimado usuario,</Text>

						<Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-800">
							El hito {milestoneName} de la orden de trabajo {otNumber} ha sido rechazado
						</Heading>

						<Section className="mb-[24px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px] text-center">
							<Text className="my-[8px] text-[32px] font-bold tracking-[5px] text-blue-600">
								{otNumber}
							</Text>
						</Section>

						{comment && (
							<Text className="mb-[24px] text-[16px] text-gray-600">Comentario: {comment}</Text>
						)}

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
