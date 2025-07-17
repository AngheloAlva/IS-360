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

interface MilestoneApprovalEmailTemplateProps {
	companyName: string
	workOrderId: string
	workOrderName: string
	responsibleName: string
	workOrderNumber: string
	approved: boolean
	rejectionReason?: string
	approvalDate?: Date
}

export const MilestoneApprovalEmail: React.FC<Readonly<MilestoneApprovalEmailTemplateProps>> = ({
	companyName,
	workOrderId,
	workOrderName,
	responsibleName,
	workOrderNumber,
	approved,
	rejectionReason,
	approvalDate,
}) => (
	<Html>
		<Tailwind>
			<Head>
				<title>
					{approved ? "Hitos Aprobados" : "Hitos Rechazados"} - Libro de Obras - OTC 360
				</title>
				<Preview>
					{approved
						? `Los hitos del libro de obras ${workOrderName} han sido aprobados`
						: `Los hitos del libro de obras ${workOrderName} requieren revisión`}
				</Preview>
			</Head>
			<Body className="bg-gray-100 py-[40px] font-sans">
				<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-lg">
					<Section className="rounded-t-[8px] px-[40px] py-[32px] text-center">
						<Img
							alt="OTC 360 Logo"
							src="https://otc360.ingsimple.cl/logo.png"
							className="mx-auto h-auto w-full max-w-[200px] object-cover"
						/>
					</Section>

					<Section className="px-[40px] py-[32px]">
						<Heading className="mb-[24px] text-center text-[28px] font-bold text-gray-800">
							{approved ? "Hitos Aprobados" : "Hitos Rechazados"}
						</Heading>

						<Text className="mb-[24px] text-[16px] leading-[24px] text-gray-600">
							{approved
								? `Estimado/a Supervisor, le informamos que los hitos del libro de obras han sido aprobados por ${responsibleName} y ya están disponibles para su uso.`
								: `Estimado/a Supervisor, le informamos que los hitos del libro de obras han sido rechazados y requieren modificaciones antes de ser aprobados.`}
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
										Número OT:
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
										Revisado por:
									</Text>
									<Text className="mb-[12px] text-[16px] leading-none text-gray-800">
										{responsibleName}
									</Text>
								</Column>
							</Row>

							{approvalDate && (
								<Text className="text-[14px] leading-[20px] text-gray-600">
									Fecha de {approved ? "aprobación" : "revisión"}:{" "}
									<span className="font-semibold">{format(approvalDate, "dd MM yyyy HH:mm")}</span>
								</Text>
							)}
						</Section>

						<Section
							className={`mb-[24px] rounded-[8px] border-l-[4px] ${
								approved ? "border-green-500 bg-green-50" : "border-amber-500 bg-amber-50"
							} p-[24px]`}
						>
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								{approved ? "Estado: Aprobado" : "Estado: Requiere Revisión"}
							</Heading>

							{approved ? (
								<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
									Los hitos del libro de obras han sido aprobados y ya están disponibles para su
									uso. Puede continuar con el registro de actividades asociadas a estos hitos.
								</Text>
							) : (
								<>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										Los hitos del libro de obras requieren modificaciones antes de ser aprobados.
										Por favor, revise los detalles y realice los cambios necesarios.
									</Text>

									{rejectionReason && (
										<>
											<Text className="mb-[4px] text-[14px] leading-[20px] font-semibold text-gray-700">
												Motivo de la revisión:
											</Text>
											<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600 italic">
												&quot;{rejectionReason}&quot;
											</Text>
										</>
									)}
								</>
							)}
						</Section>

						<Section className="mb-[24px] rounded-[8px] border-l-[4px] border-blue-500 bg-blue-50 p-[24px]">
							<Heading className="mb-[16px] text-[20px] font-bold text-gray-800">
								Próximos Pasos
							</Heading>

							{approved ? (
								<>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										<strong>1.</strong> Acceda al libro de obras para ver los hitos aprobados
									</Text>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										<strong>2.</strong> Registre actividades asociadas a los hitos correspondientes
									</Text>
									<Text className="text-[14px] leading-[20px] text-gray-600">
										<strong>3.</strong> Realice seguimiento del progreso según los hitos
										establecidos
									</Text>
								</>
							) : (
								<>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										<strong>1.</strong> Acceda al libro de obras
									</Text>
									<Text className="mb-[12px] text-[14px] leading-[20px] text-gray-600">
										<strong>2.</strong> Realice las modificaciones necesarias en los hitos
									</Text>
									<Text className="text-[14px] leading-[20px] text-gray-600">
										<strong>3.</strong> Vuelva a enviar los hitos para su aprobación
									</Text>
								</>
							)}
						</Section>

						<Section className="mb-[32px] text-center">
							<Button
								href={`${systemUrl}/admin/dashboard/ordenes-de-trabajo/${workOrderId}`}
								className={`hover:bg-opacity-90 box-border rounded-[8px] px-[32px] py-[12px] text-[16px] font-semibold text-white ${
									approved ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
								}`}
							>
								{approved ? "Ver Hitos Aprobados" : "Revisar y Modificar Hitos"}
							</Button>
						</Section>

						<Hr className="my-[24px] border-gray-200" />

						<Text className="text-[14px] leading-[20px] text-gray-600">
							Si tiene alguna pregunta sobre los hitos o necesita asistencia, no dude en contactar
							al responsable OTC o a nuestro equipo de soporte técnico.
						</Text>
					</Section>

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
