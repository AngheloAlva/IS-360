import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Hr,
	Img,
	Section,
	Text,
	Tailwind,
	Row,
	Column,
} from "@react-email/components"
import { format } from "date-fns"
import { WorkOrderTypeLabels } from "../../../../lib/consts/work-order-types"
import { WorkOrderPriorityLabels } from "../../../../lib/consts/work-order-priority"
import { systemUrl } from "@/lib/consts/systemUrl"

interface NewWorkOrderEmailProps {
	workOrder: {
		otNumber: string
		type: string
		priority: string
		equipments: {
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
	const getPriorityColor = (priority: string) => {
		switch (priority?.toLowerCase()) {
			case "alta":
				return "text-red-600 bg-red-50 border-red-200"
			case "media":
				return "text-yellow-600 bg-yellow-50 border-yellow-200"
			case "baja":
				return "text-green-600 bg-green-50 border-green-200"
			default:
				return "text-gray-600 bg-gray-50 border-gray-200"
		}
	}

	return (
		<Html>
			<Tailwind>
				<Head />
				<Body className="bg-gray-100 py-[40px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
						{/* Header with Logo */}
						<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
							<Img
								src="https://otc360.ingsimple.cl/logo.png"
								alt="OTC 360 Logo"
								className="mx-auto h-auto w-full max-w-[200px] object-cover"
							/>
						</Section>

						{/* Main Content */}
						<Section className="px-[40px] py-[32px]">
							<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
								Nueva Orden de Trabajo Asignada
							</Heading>

							<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
								Estimado/a <strong>{workOrder.supervisor.name}</strong>, se le ha asignado una nueva
								Orden de Trabajo en el sistema OTC 360.
							</Text>

							{/* Work Order Details */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									Detalles de la Orden de Trabajo
								</Heading>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Número OT:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none font-bold text-blue-600">
											{workOrder.otNumber}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Tipo:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{WorkOrderTypeLabels[workOrder.type as keyof typeof WorkOrderTypeLabels]}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Prioridad:
										</Text>
										<Text
											className={`inline-block rounded-[4px] border px-[8px] py-[4px] text-[14px] leading-none font-semibold ${getPriorityColor(workOrder.priority)}`}
										>
											{
												WorkOrderPriorityLabels[
													workOrder.priority as keyof typeof WorkOrderPriorityLabels
												]
											}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Responsable:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{workOrder.responsible.name}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[12px]">
									<Column>
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Fecha Programada:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{format(workOrder.programDate, "dd/MM/yyyy")}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Duración Estimada:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{workOrder.estimatedDays} días ({workOrder.estimatedHours} horas)
										</Text>
									</Column>
								</Row>

								{workOrder.equipments && workOrder.equipments.length > 0 && (
									<Row className="mb-[12px]">
										<Column>
											<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
												Equipos Involucrados:
											</Text>
											{workOrder.equipments.map((eq, index) => (
												<Text
													key={index}
													className="mb-[4px] text-[14px] leading-none text-gray-600"
												>
													• {eq.name}
												</Text>
											))}
										</Column>
									</Row>
								)}

								{workOrder.workDescription && (
									<Row>
										<Column>
											<Text className="mb-[4px] text-[14px] font-semibold text-gray-700">
												Descripción del Trabajo:
											</Text>
											<Text className="rounded-[4px] border border-gray-200 bg-white p-[12px] text-[14px] leading-[20px] text-gray-600">
												{workOrder.workDescription}
											</Text>
										</Column>
									</Row>
								)}
							</Section>

							{/* Action Steps */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-green-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									Próximos Pasos a Seguir
								</Heading>

								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>1.</strong> Asegúrese de completar su Carpeta de Arranque y si no está
									completa, completarla
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>2.</strong> Crear su permiso de trabajo con la OT
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>3.</strong> Crear su libro de obras con la OT
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>4.</strong> Establecer sus hitos en el libro de obras
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>5.</strong> Comenzar a agregar actividades diarias
								</Text>
							</Section>

							{/* Important Notice */}
							<Section className="mb-[24px] rounded-[8px] border border-yellow-200 bg-yellow-50 p-[20px]">
								<Text className="mb-[8px] text-[14px] font-semibold text-yellow-800">
									⚠️ Importante
								</Text>
								<Text className="text-[14px] leading-[20px] text-yellow-700">
									Es fundamental completar todos los pasos mencionados antes de iniciar los
									trabajos. La documentación completa es requisito obligatorio para el cumplimiento
									normativo.
								</Text>
							</Section>

							{/* Action Button */}
							<Section className="mb-[32px] text-center">
								<Button
									href={systemUrl}
									className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
								>
									Acceder a OTC 360
								</Button>
							</Section>

							<Hr className="my-[24px] border-gray-200" />

							<Text className="text-[14px] leading-[20px] text-gray-600">
								Para cualquier consulta sobre esta Orden de Trabajo o el proceso a seguir, contacte
								al administrador del sistema o al responsable del proyecto.
							</Text>
						</Section>

						{/* Footer */}
						<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
							<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
								© {new Date().getFullYear()} OTC 360
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
}

export default NewWorkOrderEmail
