import { systemUrl } from "@/lib/consts/systemUrl"
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components"

interface MonthlyMeetingInvitationEmailProps {
	meetingUrl: string
}

export const MonthlyMeetingInvitationEmail = ({
	meetingUrl,
}: MonthlyMeetingInvitationEmailProps): React.ReactElement => (
	<Html>
		<Tailwind>
			<Head>
				<title>Invitacion a Reunion Mensual - OTC 360</title>
				<Preview>Invitacion a reunion mensual de seguimiento en OTC 360</Preview>
			</Head>

			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							alt="OTC 360 Logo"
							src={`${systemUrl}/logo.png`}
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					<Section className="px-[40px] py-[32px]">
						<Section className="mb-[24px]">
							<Text className="mb-[16px] text-[16px] leading-[24px] text-gray-700">
								Estimados/as,
							</Text>

							<Text className="mb-[16px] text-[16px] leading-[24px] text-gray-700">
								Junto con saludar, informamos que, en el marco del Plan de Mejoramiento de nuestro
								sistema de Seguridad y Salud en el Trabajo 2026, y en cumplimiento de lo establecido
								en el DS N°44, la Ley N°16.744 y la Ley de Subcontratación N°20.123, nuestra empresa
								dará inicio, a contar de enero de 2026, a la realización de Reuniones Mensuales de
								Seguridad, Salud y Medio Ambiente con Empresas Contratistas.
							</Text>

							<Text className="mb-[16px] text-[16px] leading-[24px] text-gray-700">
								Estas instancias forman parte de las acciones de coordinación, control y mejora
								continua de la gestión preventiva, y tienen por objeto asegurar una correcta
								articulación de responsabilidades, la gestión de riesgos laborales, y el
								cumplimiento de los requisitos legales y estándares corporativos aplicables a las
								actividades desarrolladas por empresas contratistas y subcontratistas.
							</Text>

							<Text className="mb-[12px] text-[16px] leading-[24px] text-gray-700">
								En particular, las reuniones abordarán:
							</Text>

							<Section className="mb-[16px]">
								<ul
									style={{
										margin: "0",
										paddingLeft: "20px",
										color: "#374151",
										fontSize: "16px",
										lineHeight: "24px",
									}}
								>
									<li style={{ marginBottom: "8px" }}>
										Coordinación de la gestión de Seguridad y Salud en el Trabajo conforme al DS
										N°44.
									</li>
									<li style={{ marginBottom: "8px" }}>
										Cumplimiento de obligaciones del mandante y de las empresas contratistas según
										la Ley N°20.123.
									</li>
									<li style={{ marginBottom: "8px" }}>
										Revisión de indicadores de desempeño, incidentes y medidas correctivas.
									</li>
									<li style={{ marginBottom: "8px" }}>
										Gestión ambiental asociada a las actividades operativas.
									</li>
									<li>Difusión y refuerzo de procedimientos, estándares y controles críticos.</li>
								</ul>
							</Section>

							<Text className="mb-[12px] text-[16px] leading-[24px] text-gray-700">
								La calendarización será la siguiente:
							</Text>

							<Section className="mb-[16px]">
								<ul
									style={{
										margin: "0",
										paddingLeft: "20px",
										color: "#374151",
										fontSize: "16px",
										lineHeight: "24px",
									}}
								>
									<li style={{ marginBottom: "8px" }}>Fecha: Segundo martes de cada mes.</li>
									<li style={{ marginBottom: "8px" }}>Hora: 15:00.</li>
									<li>Modalidad: presencial / virtual.</li>
								</ul>
							</Section>

							<Text className="mb-[16px] text-[16px] leading-[24px] text-gray-700">
								La participación del representante con responsabilidad en Seguridad y Salud en el
								Trabajo de cada empresa contratista y del encargado de contrato es fundamental para
								el adecuado cumplimiento de las obligaciones legales y para el fortalecimiento del
								desempeño preventivo conjunto.
							</Text>

							<Text className="mb-[16px] text-[16px] leading-[24px] text-gray-700">
								Agradeceré al equipo OTC extender esta invitación a las empresas contratistas en
								servicio que no estén en copia.
							</Text>

							<Text className="mb-[16px] text-[16px] leading-[24px] text-gray-700">
								Sin otro particular, se despide atentamente,
							</Text>

							<Text className="text-[16px] leading-[24px] text-gray-700">Saludos cordiales.</Text>
						</Section>

						<Section className="mb-[24px] rounded-[8px] border border-yellow-200 bg-yellow-50 p-[16px]">
							<Text className="mb-[6px] text-[14px] font-semibold text-yellow-800">Nota</Text>
							<Text className="m-0 text-[14px] leading-[20px] text-yellow-800">
								Considere esta invitación solo si su empresa mantiene trabajos vigentes con
								Oleoducto Trasandino Chile.
							</Text>
						</Section>

						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-gray-50 p-[24px]">
							<Heading className="mb-[12px] text-[20px] font-bold text-gray-800">
								URL de la reunion
							</Heading>
							<Text className="rounded-[4px] border border-gray-200 bg-white px-[12px] py-[8px] font-mono text-[14px] text-blue-600">
								{meetingUrl}
							</Text>
						</Section>
						<Section className="mb-[32px] text-center">
							<Button
								href={meetingUrl}
								className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white"
							>
								Unirme a la Reunion
							</Button>
						</Section>
					</Section>

					<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
						<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
							© {new Date().getFullYear()} OTC 360
						</Text>
						<Text className="m-0 text-center text-[12px] text-gray-500">
							Notificacion automatica del sistema
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
