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

interface AutomatedWorkOrderResponsibleEmailProps {
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
		} | null
	}
	maintenanceTask: {
		name: string
		frequency: string
	}
}

const AutomatedWorkOrderResponsibleEmail = ({
	workOrder,
	maintenanceTask,
}: AutomatedWorkOrderResponsibleEmailProps) => {
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
						<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
							<Img
								src="https://otc360.cl/logo.png"
								alt="OTC 360 Logo"
								className="mx-auto h-auto w-full max-w-[200px] object-cover"
							/>
						</Section>

						<Section className="px-[40px] py-[32px]">
							<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
								🤖 Nueva OT Creada Automáticamente
							</Heading>

							<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
								Estimado/a <strong>{workOrder.responsible.name}</strong>, se ha creado
								automáticamente una nueva Orden de Trabajo desde una tarea de mantenimiento
								programada.
							</Text>

							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-purple-500 bg-purple-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									📋 Información de la Tarea de Mantenimiento
								</Heading>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Tarea:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none font-semibold text-purple-600">
											{maintenanceTask.name}
										</Text>
									</Column>
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Frecuencia:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{maintenanceTask.frequency}
										</Text>
									</Column>
								</Row>

								<Text className="text-[14px] leading-[20px] text-purple-700">
									Esta OT fue generada automáticamente según la programación de mantenimiento
									preventivo.
								</Text>
							</Section>

							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									📋 Detalles de la Orden de Trabajo
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
											Empresa Contratista:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{workOrder.company?.name || "OTC (Interno)"}
										</Text>
									</Column>
								</Row>

								<Row className="mb-[12px]">
									<Column className="w-[50%]">
										<Text className="mb-[4px] text-[14px] leading-none font-semibold text-gray-700">
											Supervisor Asignado:
										</Text>
										<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
											{workOrder.supervisor.name}
										</Text>
									</Column>
									<Column className="w-[50%]">
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

							<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-green-500 bg-green-50 p-[24px]">
								<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
									✅ Acciones Requeridas (Responsable OTC)
								</Heading>

								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>1.</strong> Revisar y validar los detalles de la OT automática
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>2.</strong> Coordinar con el supervisor de la empresa contratista
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>3.</strong> Verificar disponibilidad de recursos y materiales
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>4.</strong> Supervisar el progreso del trabajo según programación
								</Text>
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									<strong>5.</strong> Dar seguimiento al cumplimiento de la tarea de mantenimiento
								</Text>
							</Section>

							<Section className="mb-[24px] rounded-[8px] border border-orange-200 bg-orange-50 p-[20px]">
								<Text className="mb-[8px] text-[14px] font-semibold text-orange-800">
									🔔 Recordatorio Importante
								</Text>
								<Text className="text-[14px] leading-[20px] text-orange-700">
									Esta OT fue creada automáticamente como parte del programa de mantenimiento
									preventivo. Asegúrese de que todos los requisitos de seguridad y documentación
									estén cumplidos antes de autorizar el inicio de trabajos.
								</Text>
							</Section>

							<Section className="mb-[32px] text-center">
								<Button
									href={systemUrl}
									className="box-border rounded-[8px] bg-blue-500 px-[32px] py-[12px] text-[16px] font-semibold text-white hover:bg-blue-600"
								>
									Revisar OT en OTC 360
								</Button>
							</Section>

							<Hr className="my-[24px] border-gray-200" />

							<Text className="text-[14px] leading-[20px] text-gray-600">
								Esta notificación fue generada automáticamente por el sistema de mantenimiento
								preventivo. Para consultas, contacte al administrador del sistema.
							</Text>
						</Section>

						<Section className="rounded-b-[8px] bg-gray-50 px-[40px] py-[24px]">
							<Text className="m-0 mb-[8px] text-center text-[12px] text-gray-500">
								© {new Date().getFullYear()} OTC 360 - Sistema de Automatización
							</Text>
							<Text className="m-0 text-center text-[12px] text-gray-500">
								Notificación Automática - No Responder
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default AutomatedWorkOrderResponsibleEmail
