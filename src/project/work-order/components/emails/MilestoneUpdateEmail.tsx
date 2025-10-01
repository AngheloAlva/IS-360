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
import { systemUrl } from "@/lib/consts/systemUrl"
import { format } from "date-fns"

interface MilestoneUpdateEmailTemplateProps {
	companyName: string
	workOrderId: string
	workOrderName: string
	supervisorName: string
	workOrderNumber: string
	updateDate?: Date
	milestonesCount: number
}

export const MilestoneUpdateEmail: React.FC<Readonly<MilestoneUpdateEmailTemplateProps>> = ({
	companyName,
	workOrderId,
	workOrderName,
	supervisorName,
	workOrderNumber,
	updateDate,
	milestonesCount,
}) => (
	<Html>
		<Tailwind>
			<Head>
				<title>Actualización de Hitos - Libro de Obras - IS 360</title>
				<Preview>Se han actualizado los hitos del libro de obras {workOrderName}</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							alt="IS 360 Logo"
							src="https://is360.ingsimple.cl/logo.jpg"
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					<Section className="px-[40px] py-[32px]">
						<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
							Actualización de Hitos del Libro de Obras
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							Estimado/a Responsable de la OT, le informamos que se han actualizado los hitos del
							siguiente libro de obras y requieren su validación:
						</Text>

						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Detalles del Libro de Obras
							</Heading>

							<Row className="mb-[12px]">
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Nombre:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{workOrderName}
									</Text>
								</Column>
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Número
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{workOrderNumber}
									</Text>
								</Column>
							</Row>

							<Row className="mb-[12px]">
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Empresa:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{companyName}
									</Text>
								</Column>
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Supervisor:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{supervisorName}
									</Text>
								</Column>
							</Row>

							<Row className="mb-[12px]">
								<Column className="w-[50%]">
									<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
										Cantidad de Hitos:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{milestonesCount}
									</Text>
								</Column>
								{updateDate && (
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Fecha de actualización:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{format(updateDate, "dd MMMM yyyy, HH:mm")}
										</Text>
									</Column>
								)}
							</Row>
						</Section>

						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-orange-500 bg-orange-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Acción Requerida
							</Heading>

							<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
								Los hitos del libro de obras han sido actualizados y requieren su validación antes
								de que puedan ser utilizados para el seguimiento del proyecto.
							</Text>
						</Section>

						<Section className="mb-[32px] text-center">
							<Button
								href={`${systemUrl}/admin/dashboard/ordenes-de-trabajo/${workOrderId}`}
								className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
							>
								Revisar y Validar Hitos
							</Button>
						</Section>

						<Hr className="my-[24px] border-gray-200" />

						<Text className="text-[14px] leading-[20px] text-gray-600">
							Si tiene alguna pregunta sobre los hitos actualizados o necesita asistencia, no dude
							en contactar al supervisor responsable o a nuestro equipo de soporte técnico.
						</Text>
					</Section>

					<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
						<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
							© {new Date().getFullYear()} IS 360
						</Text>
						<Text className="m-0 text-center text-[12px] text-gray-500">
							Notificación Automática del Sistema - No Responder
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
