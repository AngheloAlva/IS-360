import {
	Hr,
	Img,
	Row,
	Html,
	Text,
	Body,
	Head,
	Button,
	Column,
	Section,
	Heading,
	Preview,
	Tailwind,
	Container,
} from "@react-email/components"

interface NewuserEmailTemplateProps {
	name: string
	email: string
	password: string
}

const systemUrl = "https://otc360.ingsimple.cl"

export const NewUserEmailTemplate: React.FC<Readonly<NewuserEmailTemplateProps>> = ({
	name,
	email,
	password,
}) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Bienvenido a OTC 360</title>
				<Preview>Bienvenido al sistema OTC 360. Aquí están sus credenciales de acceso.</Preview>
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
							¡Bienvenido a OTC 360!
						</Heading>

						<Text className="mb-[16px] text-[16px] text-gray-600">Estimado(a) {name},</Text>

						<Text className="mb-[24px] text-[16px] text-gray-600">
							Nos complace darle la bienvenida a <strong>OTC 360</strong>. Su cuenta ha sido creada
							exitosamente y ya puede comenzar a utilizar el sistema.
						</Text>

						<Section className="mb-[24px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px]">
							<Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
								Sus datos de acceso
							</Heading>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[16px] text-gray-700">
										<strong>URL del sistema:</strong>
									</Text>
								</Column>
								<Column>
									<Text className="mb-[8px] ml-auto text-[16px] text-blue-600">{systemUrl}</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[16px] text-gray-700">
										<strong>Email:</strong>
									</Text>
								</Column>
								<Column>
									<Text className="mb-[8px] ml-auto text-[16px] text-gray-800">{email}</Text>
								</Column>
							</Row>

							<Row>
								<Column>
									<Text className="mb-[8px] text-[16px] text-gray-700">
										<strong>Contraseña temporal:</strong>
									</Text>
								</Column>
								<Column>
									<Text className="mb-[8px] ml-auto text-[16px] text-gray-800">{password}</Text>
								</Column>
							</Row>
						</Section>

						<Text className="mb-[24px] text-[16px] text-gray-600">
							Por razones de seguridad, deberá cambiar su contraseña temporal después de iniciar
							sesión por primera vez.
						</Text>

						<Section className="mb-[32px] text-center">
							<Button
								href={systemUrl}
								className="box-input rounded-[4px] bg-blue-600 px-[24px] py-[12px] text-center font-bold text-white no-underline"
							>
								Acceder al Sistema
							</Button>
						</Section>

						<Text className="mb-[16px] text-[16px] text-gray-600">
							Si tiene alguna pregunta o necesita asistencia, no dude en contactar a nuestro equipo
							de soporte técnico.
						</Text>

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
