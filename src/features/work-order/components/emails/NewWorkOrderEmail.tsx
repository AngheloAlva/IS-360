import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Hr,
	Img,
	Preview,
	Section,
	Text,
	Tailwind,
	Row,
	Column,
} from "@react-email/components"
import { format } from "date-fns"
import { WorkOrderTypeLabels } from "../../../../lib/consts/work-order-types"
import { WorkOrderPriorityLabels } from "../../../../lib/consts/work-order-priority"

const systemUrl = "https://otc360.ingsimple.cl"

interface NewWorkOrderEmailProps {
	workOrder: {
		otNumber: string
		type: string
		priority: string
		equipment: {
			name: string
		}[]
		programDate: Date
		estimatedDays: number
		estimatedHours: number
		responsible: {
			name: string
		}
		workDescription: string | null
		supervisor: {
			name: string
			email: string
		}
	}
}

const NewWorkOrderEmail = ({ workOrder }: NewWorkOrderEmailProps) => {
	const currentYear = new Date().getFullYear()

	return (
		<Html>
			<Tailwind>
				<Head>
					<title>Nueva Orden de Trabajo Asignada - {workOrder.otNumber}</title>
					<Preview>
						Se ha creado una nueva orden de trabajo {workOrder.otNumber} que requiere su atención
					</Preview>
				</Head>
				<Body className="bg-gray-100 py-[40px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[20px]">
						<Section className="mb-[32px] text-center">
							<Img
								width="150"
								height="142"
								alt="OTC 360 Logo"
								src={`${systemUrl}/logo.png`}
								className="mx-auto h-auto w-[150px] object-cover"
							/>
						</Section>

						<Section>
							<Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-800">
								Nueva Orden de Trabajo Asignada
							</Heading>

							<Text className="mb-[16px] text-[16px] text-gray-600">
								Estimado/a {workOrder.supervisor.name},
							</Text>

							<Text className="mb-[24px] text-[16px] text-gray-600">
								Le informamos que se ha creado una nueva <strong>Orden de Trabajo</strong> que ha
								sido asignada a su empresa. Es necesario que cree el libro de obras correspondiente
								e inicie la planificación de actividades.
							</Text>

							<Section className="mb-[24px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px]">
								<Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
									Detalles de la Orden de Trabajo
								</Heading>

								<Row className="mb-[8px]">
									<Column className="w-[40%]">
										<Text className="mb-[8px] text-[16px] text-gray-700">
											<strong>Número OT:</strong>
										</Text>
									</Column>
									<Column className="w-[60%]">
										<Text className="mb-[8px] text-[16px] text-gray-800">{workOrder.otNumber}</Text>
									</Column>
								</Row>

								<Row className="mb-[8px]">
									<Column className="w-[40%]">
										<Text className="mb-[8px] text-[16px] text-gray-700">
											<strong>Tipo:</strong>
										</Text>
									</Column>
									<Column className="w-[60%]">
										<Text className="mb-[8px] text-[16px] text-gray-800">
											{WorkOrderTypeLabels[workOrder.type as keyof typeof WorkOrderTypeLabels]}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[8px]">
									<Column className="w-[40%]">
										<Text className="mb-[8px] text-[16px] text-gray-700">
											<strong>Prioridad:</strong>
										</Text>
									</Column>
									<Column className="w-[60%]">
										<Text className="mb-[8px] text-[16px] font-bold text-gray-800">
											{
												WorkOrderPriorityLabels[
													workOrder.priority as keyof typeof WorkOrderPriorityLabels
												]
											}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[8px]">
									<Column className="w-[40%]">
										<Text className="mb-[8px] text-[16px] text-gray-700">
											<strong>Equipo:</strong>
										</Text>
									</Column>
									<Column className="w-[60%]">
										<Text className="mb-[8px] text-[16px] text-gray-800">
											{workOrder.equipment.map((equipment) => equipment.name).join(", ")}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[8px]">
									<Column className="w-[40%]">
										<Text className="mb-[8px] text-[16px] text-gray-700">
											<strong>Fecha programada:</strong>
										</Text>
									</Column>
									<Column className="w-[60%]">
										<Text className="mb-[8px] text-[16px] text-gray-800">
											{format(workOrder.programDate, "dd/MM/yyyy") || "No definida"}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[8px]">
									<Column className="w-[40%]">
										<Text className="mb-[8px] text-[16px] text-gray-700">
											<strong>Tiempo estimado:</strong>
										</Text>
									</Column>
									<Column className="w-[60%]">
										<Text className="mb-[8px] text-[16px] text-gray-800">
											{workOrder.estimatedDays} días ({workOrder.estimatedHours} horas)
										</Text>
									</Column>
								</Row>

								<Row className="mb-[8px]">
									<Column className="w-[40%]">
										<Text className="mb-[8px] text-[16px] text-gray-700">
											<strong>Responsable de OTC:</strong>
										</Text>
									</Column>
									<Column className="w-[60%]">
										<Text className="mb-[8px] text-[16px] text-gray-800">
											{workOrder.responsible.name}
										</Text>
									</Column>
								</Row>
							</Section>

							{workOrder.workDescription && (
								<Section className="mb-[24px]">
									<Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
										Descripción del trabajo
									</Heading>
									<Text className="mb-[16px] rounded-[8px] border border-gray-200 bg-gray-50 p-[16px] text-[16px] text-gray-700">
										{workOrder.workDescription}
									</Text>
								</Section>
							)}

							<Text className="mb-[24px] text-[16px] text-gray-600">
								<strong>Acciones requeridas:</strong>
							</Text>

							<Text className="mb-[8px] text-[16px] text-gray-600">
								1. Crear el libro de obras para esta OT
							</Text>
							<Text className="mb-[8px] text-[16px] text-gray-600">
								2. Planificar las actividades a realizar
							</Text>
							<Text className="mb-[24px] text-[16px] text-gray-600">
								3. Iniciar el registro de actividades cuando comience la obra
							</Text>

							<Section className="mb-[16px] text-center">
								<Button
									href={systemUrl}
									className="mb-[16px] box-border rounded-[4px] bg-green-600 px-[24px] py-[12px] text-center font-bold text-white no-underline"
								>
									Ingresar al sistema
								</Button>
							</Section>

							<Text className="mb-[16px] text-[16px] text-gray-600">
								Si tiene alguna pregunta o necesita más información, por favor contacte al
								responsable de la orden de trabajo o al equipo de soporte técnico.
							</Text>

							<Text className="mb-[8px] text-[16px] text-gray-600">Saludos cordiales,</Text>

							<Text className="mb-[24px] text-[16px] font-bold text-gray-700">
								El equipo de OTC 360
							</Text>
						</Section>

						<Hr className="my-[24px] border-t border-gray-300" />

						<Section>
							<Text className="m-0 text-center text-[14px] text-gray-500">
								© {currentYear} OTC 360. Todos los derechos reservados.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default NewWorkOrderEmail
