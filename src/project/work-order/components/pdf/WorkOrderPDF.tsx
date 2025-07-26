"use client"
/* eslint-disable jsx-a11y/alt-text */

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import type { WorkOrderPDFData } from "@/app/api/work-order/pdf/[id]/types"

const styles = StyleSheet.create({
	page: {
		padding: 35,
		fontSize: 10,
		backgroundColor: "#fff",
		fontFamily: "Helvetica",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 25,
		borderBottomWidth: 2,
		borderBottomStyle: "solid",
		borderBottomColor: "#EA580C",
		paddingBottom: 12,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#9A3412",
		marginLeft: 15,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 18,
		textAlign: "center",
		color: "#9A3412",
	},
	subtitle: {
		fontSize: 13,
		fontWeight: "bold",
		marginTop: 12,
		marginBottom: 6,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#EA580C",
		paddingBottom: 4,
		color: "#9A3412",
	},
	section: {
		marginBottom: 14,
		padding: 8,
		borderRadius: 4,
		backgroundColor: "#FFF7ED",
	},
	row: {
		flexDirection: "row",
		marginBottom: 7,
	},
	column: {
		flex: 1,
		paddingHorizontal: 4,
	},
	label: {
		fontWeight: "bold",
		marginRight: 5,
		color: "#7C2D12",
	},
	value: {
		flex: 1,
		color: "#111827",
	},
	field: {
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#FED7AA",
		padding: 6,
		marginBottom: 6,
		borderRadius: 2,
	},
	table: {
		display: "flex",
		width: "100%",
		borderWidth: 1,
		borderColor: "#FED7AA",
		marginVertical: 10,
		borderRadius: 4,
		overflow: "hidden",
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderColor: "#FED7AA",
	},
	tableCol: {
		borderStyle: "solid",
		borderRightWidth: 1,
		borderColor: "#FED7AA",
		padding: 6,
	},
	tableHeader: {
		backgroundColor: "#FED7AA",
		color: "#9A3412",
		fontWeight: "bold",
		textAlign: "center",
		padding: 6,
	},
	tableCell: {
		padding: 6,
		textAlign: "left",
		color: "#374151",
		fontSize: 9,
	},
	lastCol: {
		borderRightWidth: 0,
	},
	footer: {
		position: "absolute",
		bottom: 35,
		left: 35,
		right: 35,
		textAlign: "center",
		fontSize: 8,
		color: "#6B7280",
		borderTopWidth: 1,
		borderTopColor: "#FED7AA",
		borderTopStyle: "solid",
		paddingTop: 8,
	},
	logo: {
		width: 50,
		height: 50,
		objectFit: "contain",
	},
	milestoneSection: {
		marginBottom: 20,
		padding: 10,
		borderRadius: 4,
		backgroundColor: "#FFFBEB",
		borderWidth: 1,
		borderColor: "#FED7AA",
		borderStyle: "solid",
	},
	milestoneTitle: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#9A3412",
		marginBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#EA580C",
		borderBottomStyle: "solid",
		paddingBottom: 4,
	},
	activityRow: {
		flexDirection: "row",
		marginBottom: 4,
		padding: 4,
		backgroundColor: "#FFF7ED",
		borderRadius: 2,
	},
	activityLabel: {
		fontWeight: "bold",
		width: "25%",
		color: "#7C2D12",
		fontSize: 9,
	},
	activityValue: {
		flex: 1,
		color: "#374151",
		fontSize: 9,
	},
	statusBadge: {
		padding: 3,
		borderRadius: 3,
		fontSize: 10,
		fontWeight: "bold",
		textAlign: "center",
		marginLeft: "auto",
	},
	statusCompleted: {
		backgroundColor: "#DCFCE7",
		color: "#166534",
	},
	statusInProgress: {
		backgroundColor: "#FEF3C7",
		color: "#92400E",
	},
	statusReported: {
		backgroundColor: "#FEF3C7",
		color: "#92400E",
	},
	statusResolved: {
		backgroundColor: "#DCFCE7",
		color: "#166534",
	},
})

interface WorkOrderPDFProps {
	workOrder: WorkOrderPDFData
}

const WorkOrderPDF = ({ workOrder }: WorkOrderPDFProps) => {
	const getEntryTypeLabel = (type: string) => {
		switch (type) {
			case "DAILY_ACTIVITY":
				return "Actividad Diaria"
			case "ADDITIONAL_ACTIVITY":
				return "Actividad Adicional"
			case "PREVENTION_AREA":
				return "Área de Prevención"
			case "OTC_INSPECTION":
				return "Inspección OTC"
			case "COMMENT":
				return "Comentario"
			case "USER_NOTE":
				return "Nota de Usuario"
			default:
				return type
		}
	}

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "Completado"
			case "IN_PROGRESS":
				return "En Progreso"
			case "PENDING":
				return "Pendiente"
			case "CANCELLED":
				return "Cancelado"
			case "REPORTED":
				return "Reportado"
			case "RESOLVED":
				return "Resuelto"
			default:
				return status
		}
	}

	const getStatusStyle = (status: string) => {
		switch (status) {
			case "COMPLETED":
			case "RESOLVED":
				return [styles.statusBadge, styles.statusCompleted]
			case "IN_PROGRESS":
			case "REPORTED":
				return [styles.statusBadge, styles.statusInProgress]
			default:
				return [styles.statusBadge, styles.statusInProgress]
		}
	}

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Image style={styles.logo} src="https://otc360.ingsimple.cl/logo.png" />
						<Text style={styles.headerTitle}>REPORTE DE ORDEN DE TRABAJO</Text>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.subtitle}>1. INFORMACIÓN GENERAL DE LA ORDEN DE TRABAJO</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>N° OT:</Text>
								<Text style={styles.value}>{workOrder.otNumber}</Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Nombre del Trabajo:</Text>
								<Text style={styles.value}>{workOrder.workName || "No especificado"}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Trabajo Requerido:</Text>
								<Text style={styles.value}>{workOrder.workRequest}</Text>
							</View>
						</View>
					</View>

					{workOrder.company && (
						<View style={styles.row}>
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>Empresa:</Text>
									<Text style={styles.value}>{workOrder.company.name}</Text>
								</View>
							</View>
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>RUT Empresa:</Text>
									<Text style={styles.value}>{workOrder.company.rut}</Text>
								</View>
							</View>
						</View>
					)}

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Responsable:</Text>
								<Text style={styles.value}>{workOrder.responsible.name}</Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Supervisor:</Text>
								<Text style={styles.value}>{workOrder.supervisor.name}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Fecha de Inicio:</Text>
								<Text style={styles.value}>
									{workOrder.workStartDate
										? format(new Date(workOrder.workStartDate), "dd/MM/yyyy", { locale: es })
										: "No especificada"}
								</Text>
							</View>
						</View>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Progreso:</Text>
								<Text style={styles.value}>{workOrder.workProgressStatus || 0}%</Text>
							</View>
						</View>
					</View>
				</View>

				{workOrder.equipment && workOrder.equipment.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.subtitle}>2. EQUIPOS INVOLUCRADOS</Text>
						<View style={styles.table}>
							<View style={styles.tableRow}>
								<View style={[styles.tableCol, styles.tableHeader, { width: "20%" }]}>
									<Text>TAG</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, { width: "30%" }]}>
									<Text>Nombre</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, { width: "25%" }]}>
									<Text>Ubicación</Text>
								</View>
								<View
									style={[styles.tableCol, styles.tableHeader, styles.lastCol, { width: "25%" }]}
								>
									<Text>Descripción</Text>
								</View>
							</View>
							{workOrder.equipment.map((equipment, index) => (
								<View style={styles.tableRow} key={index}>
									<View style={[styles.tableCol, { width: "20%" }]}>
										<Text style={styles.tableCell}>{equipment.tag}</Text>
									</View>
									<View style={[styles.tableCol, { width: "30%" }]}>
										<Text style={styles.tableCell}>{equipment.name}</Text>
									</View>
									<View style={[styles.tableCol, { width: "25%" }]}>
										<Text style={styles.tableCell}>{equipment.location}</Text>
									</View>
									<View style={[styles.tableCol, styles.lastCol, { width: "25%" }]}>
										<Text style={styles.tableCell}>{equipment.description || "N/A"}</Text>
									</View>
								</View>
							))}
						</View>
					</View>
				)}

				{workOrder.milestones && workOrder.milestones.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.subtitle}>3. HITOS DEL PROYECTO</Text>

						{workOrder.milestones.map((milestone, index) => (
							<View style={styles.milestoneSection} key={milestone.id}>
								<View style={{ flexDirection: "row", alignItems: "center" }}>
									<Text style={styles.milestoneTitle}>
										{index + 1}. {milestone.name}
									</Text>

									<View style={getStatusStyle(milestone.status)}>
										<Text>{getStatusLabel(milestone.status)}</Text>
									</View>
								</View>

								{milestone.description && (
									<View style={styles.activityRow}>
										<Text style={styles.activityLabel}>Descripción:</Text>
										<Text style={styles.activityValue}>{milestone.description}</Text>
									</View>
								)}

								<View style={styles.activityRow}>
									<Text style={styles.activityLabel}>Peso:</Text>
									<Text style={styles.activityValue}>{milestone.weight}%</Text>
								</View>

								{milestone.startDate && (
									<View style={styles.activityRow}>
										<Text style={styles.activityLabel}>Fecha Inicio:</Text>
										<Text style={styles.activityValue}>
											{format(new Date(milestone.startDate), "dd/MM/yyyy", { locale: es })}
										</Text>
									</View>
								)}

								{milestone.endDate && (
									<View style={styles.activityRow}>
										<Text style={styles.activityLabel}>Fecha Fin:</Text>
										<Text style={styles.activityValue}>
											{format(new Date(milestone.endDate), "dd/MM/yyyy", { locale: es })}
										</Text>
									</View>
								)}
							</View>
						))}
					</View>
				)}

				{workOrder.workEntries && workOrder.workEntries.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.subtitle}>4. REGISTRO DE ACTIVIDADES</Text>
						<View style={styles.table}>
							<View style={styles.tableRow}>
								<View style={[styles.tableCol, styles.tableHeader, { width: "10%" }]}>
									<Text>Fecha</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, { width: "15%" }]}>
									<Text>Tipo</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, { width: "20%" }]}>
									<Text>Actividad</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, { width: "15%" }]}>
									<Text>Hito</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, { width: "15%" }]}>
									<Text>Creado por</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, { width: "12%" }]}>
									<Text>Horario</Text>
								</View>
								<View
									style={[styles.tableCol, styles.tableHeader, styles.lastCol, { width: "13%" }]}
								>
									<Text>Estado</Text>
								</View>
							</View>

							{workOrder.workEntries.map((entry) => (
								<View style={styles.tableRow} key={entry.id}>
									<View style={[styles.tableCol, { width: "10%" }]}>
										<Text style={styles.tableCell}>
											{format(new Date(entry.executionDate), "dd/MM/yy", { locale: es })}
										</Text>
									</View>
									<View style={[styles.tableCol, { width: "15%" }]}>
										<Text style={styles.tableCell}>{getEntryTypeLabel(entry.entryType)}</Text>
									</View>
									<View style={[styles.tableCol, { width: "20%" }]}>
										<Text style={styles.tableCell}>{entry.activityName || "N/A"}</Text>
									</View>
									<View style={[styles.tableCol, { width: "15%" }]}>
										<Text style={styles.tableCell}>{entry.milestone?.name || "N/A"}</Text>
									</View>
									<View style={[styles.tableCol, { width: "15%" }]}>
										<Text style={styles.tableCell}>{entry.createdBy.name}</Text>
									</View>
									<View style={[styles.tableCol, { width: "12%" }]}>
										<Text style={{ ...styles.tableCell, flexDirection: "column", display: "flex" }}>
											<Text>{entry.activityStartTime}</Text>
											<Text>{entry.activityEndTime}</Text>
										</Text>
									</View>
									<View style={[styles.tableCol, styles.lastCol, { width: "13%" }]}>
										{entry.entryType === "OTC_INSPECTION" && entry.inspectionStatus ? (
											<View style={getStatusStyle(entry.inspectionStatus)}>
												<Text>{getStatusLabel(entry.inspectionStatus)}</Text>
											</View>
										) : (
											<Text style={styles.tableCell}>-</Text>
										)}
									</View>
								</View>
							))}
						</View>
					</View>
				)}

				<View style={styles.footer}>
					<Text>
						Reporte generado el {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })} - OTC
					</Text>
				</View>
			</Page>

			{workOrder.workEntries && workOrder.workEntries.length > 0 && (
				<Page size="A4" style={styles.page}>
					<View style={styles.header}>
						<View style={{ flexDirection: "row", alignItems: "center" }}>
							<Image style={styles.logo} src="https://otc360.ingsimple.cl/logo.png" />
							<Text style={styles.headerTitle}>DETALLE DE ACTIVIDADES</Text>
						</View>
						<View>
							<Text>{workOrder.otNumber}</Text>
						</View>
					</View>

					{workOrder.workEntries.map((entry, index) => (
						<View style={styles.section} key={entry.id}>
							<Text style={styles.subtitle}>
								{index + 1}. {getEntryTypeLabel(entry.entryType)} -{" "}
								{format(new Date(entry.executionDate), "dd/MM/yyyy", { locale: es })}
							</Text>

							{entry.activityName && (
								<View style={styles.activityRow}>
									<Text style={styles.activityLabel}>Actividad:</Text>
									<Text style={styles.activityValue}>{entry.activityName}</Text>
								</View>
							)}

							<View style={styles.activityRow}>
								<Text style={styles.activityLabel}>Creado por:</Text>
								<Text style={styles.activityValue}>{entry.createdBy.name}</Text>
							</View>

							{entry.milestone && (
								<View style={styles.activityRow}>
									<Text style={styles.activityLabel}>Hito:</Text>
									<Text style={styles.activityValue}>{entry.milestone.name}</Text>
								</View>
							)}

							{entry.activityStartTime && entry.activityEndTime && (
								<View style={styles.activityRow}>
									<Text style={styles.activityLabel}>Horario:</Text>
									<Text style={styles.activityValue}>
										{entry.activityStartTime} - {entry.activityEndTime}
									</Text>
								</View>
							)}

							{entry.comments && (
								<View style={styles.activityRow}>
									<Text style={styles.activityLabel}>Comentarios:</Text>
									<Text style={styles.activityValue}>{entry.comments}</Text>
								</View>
							)}

							{entry.entryType === "OTC_INSPECTION" && (
								<>
									{entry.inspectionStatus && (
										<View style={styles.activityRow}>
											<Text style={styles.activityLabel}>Estado Inspección:</Text>
											<View style={getStatusStyle(entry.inspectionStatus)}>
												<Text>{getStatusLabel(entry.inspectionStatus)}</Text>
											</View>
										</View>
									)}

									{entry.inspectorName && (
										<View style={styles.activityRow}>
											<Text style={styles.activityLabel}>Inspector:</Text>
											<Text style={styles.activityValue}>{entry.inspectorName}</Text>
										</View>
									)}

									{entry.safetyObservations && (
										<View style={styles.activityRow}>
											<Text style={styles.activityLabel}>Observaciones de Seguridad:</Text>
											<Text style={styles.activityValue}>{entry.safetyObservations}</Text>
										</View>
									)}

									{entry.nonConformities && (
										<View style={styles.activityRow}>
											<Text style={styles.activityLabel}>No Conformidades:</Text>
											<Text style={styles.activityValue}>{entry.nonConformities}</Text>
										</View>
									)}

									{entry.recommendations && (
										<View style={styles.activityRow}>
											<Text style={styles.activityLabel}>Recomendaciones:</Text>
											<Text style={styles.activityValue}>{entry.recommendations}</Text>
										</View>
									)}
								</>
							)}

							{entry.assignedUsers && entry.assignedUsers.length > 0 && (
								<View style={styles.activityRow}>
									<Text style={styles.activityLabel}>Usuarios Asignados:</Text>
									<Text style={styles.activityValue}>
										{entry.assignedUsers.map((user) => user.name).join(", ")}
									</Text>
								</View>
							)}
						</View>
					))}

					<View style={styles.footer}>
						<Text>
							Reporte generado el {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })} - OTC
						</Text>
					</View>
				</Page>
			)}
		</Document>
	)
}

export default WorkOrderPDF
