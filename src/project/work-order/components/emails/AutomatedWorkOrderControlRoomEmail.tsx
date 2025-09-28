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

interface AutomatedWorkOrderControlRoomEmailProps {
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
		company: {
			name: string
		}
	}
	maintenanceTask: {
		name: string
		frequency: string
	}
}

const AutomatedWorkOrderControlRoomEmail = ({
	workOrder,
	maintenanceTask,
}: AutomatedWorkOrderControlRoomEmailProps) => {
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
								src="https://otc360.cl/logo.png"
								alt="OTC 360 Logo"
								className="mx-auto h-auto w-full max-w-[200px] object-cover"
							/>
						</Section>

						{/* Main Content */}
						<Section className="px-[40px] py-[32px]">
							<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
								🎛️ OT Automática - Sala de Control
							</Heading>

							<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
								<strong>Sala de Control</strong>, se ha generado automáticamente una nueva Orden de
								Trabajo desde el sistema de mantenimiento preventivo. Esta notificación es para su
								conocimiento y seguimiento operacional.
							</Text>

							{/* Automation Info */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-indigo-500 bg-indigo-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									🤖 Origen: Mantenimiento Automático
								</Heading>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Tarea de Mantenimiento:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none font-semibold text-indigo-600">
											{maintenanceTask.name}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Frecuencia Programada:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{maintenanceTask.frequency}
										</Text>
									</Column>
								</Row>

								<Text className="text-[14px] leading-[20px] text-indigo-700">
									⚡ Esta OT fue creada automáticamente por el sistema según la programación de
									mantenimiento preventivo.
								</Text>
							</Section>

							{/* Work Order Summary for Control Room */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									📋 Resumen de la Orden de Trabajo
								</Heading>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Número OT:
										</Text>
										<Text className="mb-[12px] text-[18px] leading-none font-bold text-blue-600">
											{workOrder.otNumber}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Estado:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none font-semibold text-green-600">
											PLANIFICADA
										</Text>
									</Column>
								</Row>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Tipo de Trabajo:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{WorkOrderTypeLabels[workOrder.type as keyof typeof WorkOrderTypeLabels]}
										</Text>
									</Column>
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
								</Row>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Fecha Programada:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{format(workOrder.programDate, "dd/MM/yyyy")}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Duración Estimada:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{workOrder.estimatedDays} días ({workOrder.estimatedHours}h)
										</Text>
									</Column>
								</Row>
							</Section>

							{/* Personnel and Equipment Info */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-green-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									👥 Personal y Equipos Involucrados
								</Heading>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Responsable OTC:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{workOrder.responsible.name}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Empresa Contratista:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{workOrder.company.name}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[12px]">
									<Column>
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Supervisor Asignado:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{workOrder.supervisor.name}
										</Text>
									</Column>
								</Row>

								{workOrder.equipments && workOrder.equipments.length > 0 && (
									<Row className="mb-[12px]">
										<Column>
											<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
												Equipos/Sistemas Afectados:
											</Text>
											{workOrder.equipments.map((eq, index) => (
												<Text
													key={index}
													className="mb-[4px] text-[14px] leading-none font-medium text-gray-600"
												>
													🔧 {eq.name}
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

							{/* Operational Considerations */}
							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-yellow-500 bg-yellow-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									⚠️ Consideraciones Operacionales
								</Heading>

								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									• <strong>Seguimiento:</strong> Monitorear el progreso de la OT según programación
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									• <strong>Coordinación:</strong> Mantener comunicación con el responsable OTC y
									supervisor
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									• <strong>Recursos:</strong> Verificar disponibilidad de sistemas y equipos
									durante la intervención
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									• <strong>Seguridad:</strong> Confirmar cumplimiento de protocolos antes del
									inicio de trabajos
								</Text>
							</Section>

							{/* Action Button */}
							<Section className="mb-[32px] text-center">
								<Button
									href={systemUrl}
									className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
								>
									Ver Detalle en OTC 360
								</Button>
							</Section>

							<Hr className="my-[24px] border-gray-200" />

							<Text className="text-[14px] leading-[20px] text-gray-600">
								Esta notificación automática es generada por el sistema de mantenimiento preventivo
								para mantener informada a Sala de Control sobre las actividades programadas. No
								requiere respuesta.
							</Text>
						</Section>

						{/* Footer */}
						<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
							<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
								© {new Date().getFullYear()} OTC 360 - Sala de Control
							</Text>
							<Text className="m-0 text-center text-[12px] text-gray-500">
								Sistema de Automatización - Notificación Informativa
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default AutomatedWorkOrderControlRoomEmail
