"use client"
/* eslint-disable jsx-a11y/alt-text */

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import type { LockoutPermitData } from "@/app/api/lockout-permit/pdf/[id]/types"

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
		borderBottomColor: "#efb100",
		paddingBottom: 12,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#7ccf00",
		marginLeft: 15,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 18,
		textAlign: "center",
		color: "#7ccf00",
	},
	subtitle: {
		fontSize: 13,
		fontWeight: "bold",
		marginTop: 12,
		marginBottom: 6,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#efb100",
		paddingBottom: 4,
		color: "#7ccf00",
	},
	section: {
		marginBottom: 14,
		padding: 8,
		borderRadius: 4,
		backgroundColor: "#f8ffe660",
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
		color: "#4B5563",
	},
	value: {
		flex: 1,
		color: "#111827",
	},
	field: {
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: "#D1D5DB",
		padding: 6,
		marginBottom: 6,
		borderRadius: 2,
	},
	customLargeField: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#D1D5DB",
		padding: 6,
		height: 38,
		marginBottom: 6,
		borderRadius: 2,
		backgroundColor: "#f8ffe6",
	},
	signatureBox: {
		height: 80,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "#D1D5DB",
		marginTop: 6,
		marginBottom: 6,
		padding: 6,
		borderRadius: 4,
		backgroundColor: "#f8ffe6",
		breakInside: "avoid",
	},
	signatureLabel: {
		textAlign: "center",
		marginTop: 6,
		fontWeight: "medium",
		color: "#4B5563",
		breakInside: "avoid",
	},
	signatureSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 35,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		borderTopStyle: "solid",
		breakInside: "avoid",
	},
	signatureColumn: {
		width: "30%",
		paddingHorizontal: 8,
		breakInside: "avoid",
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
		borderTopColor: "#E5E7EB",
		borderTopStyle: "solid",
		paddingTop: 8,
	},
	logo: {
		width: 50,
		height: 50,
		objectFit: "contain",
	},
	table: {
		display: "flex",
		width: "100%",
		borderWidth: 1,
		borderColor: "#D1D5DB",
		marginVertical: 10,
		borderRadius: 4,
		overflow: "hidden",
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderColor: "#D1D5DB",
	},
	tableCol: {
		borderStyle: "solid",
		borderRightWidth: 1,
		borderColor: "#D1D5DB",
		padding: 6,
		flex: 1,
	},
	tableHeader: {
		backgroundColor: "#fef9e6",
		color: "#7ccf00",
		fontWeight: "bold",
		textAlign: "center",
		padding: 6,
	},
	tableCell: {
		padding: 6,
		textAlign: "center",
		color: "#374151",
		fontSize: 9,
	},
	lastCol: {
		borderRightWidth: 0,
	},
	activityItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 4,
		paddingHorizontal: 4,
	},
	activityNumber: {
		width: 20,
		fontSize: 9,
		fontWeight: "bold",
		color: "#7ccf00",
		marginRight: 8,
	},
	activityText: {
		flex: 1,
		fontSize: 9,
		color: "#374151",
	},
	statusBadge: {
		backgroundColor: "#fef9e6",
		color: "#7ccf00",
		padding: 4,
		borderRadius: 3,
		fontSize: 9,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 6,
	},
})

interface LockoutPermitPDFProps {
	lockoutPermit: LockoutPermitData
}

const LockoutPermitPDF = ({ lockoutPermit }: LockoutPermitPDFProps) => {
	const getStatusLabel = (status: string) => {
		switch (status) {
			case "REVIEW_PENDING":
				return "Pendiente de Revisión"
			case "ACTIVE":
				return "Activo"
			case "COMPLETED":
				return "Completado"
			case "REJECTED":
				return "Rechazado"
			default:
				return status
		}
	}

	const getLockoutTypeLabel = (type: string) => {
		switch (type) {
			case "PREVENTIVE":
				return "Preventivo"
			case "CORRECTIVE":
				return "Correctivo"
			case "EMERGENCY":
				return "Emergencia"
			case "OTHER":
				return "Otro"
			default:
				return type
		}
	}

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Encabezado */}
				<View style={styles.header}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Image style={styles.logo} src="https://otc360.ingsimple.cl/logo.png" />
						<Text style={styles.headerTitle}>PERMISO DE BLOQUEO</Text>
					</View>
					<View>
						<Text>
							Fecha de emisión:{" "}
							{format(new Date(lockoutPermit.createdAt), "dd/MM/yyyy", { locale: es })}
						</Text>
						<Text>
							Fecha de inicio:{" "}
							{format(new Date(lockoutPermit.startDate), "dd/MM/yyyy", { locale: es })}
						</Text>
						<Text>
							Fecha de finalización:{" "}
							{format(new Date(lockoutPermit.endDate), "dd/MM/yyyy", { locale: es })}
						</Text>
					</View>
				</View>

				{/* Información del permiso */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>1. INFORMACIÓN GENERAL</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Responsable de Área:</Text>
								<Text style={styles.value}>{lockoutPermit.areaResponsible.name}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Estado:</Text>
								<Text style={styles.value}>{getStatusLabel(lockoutPermit.status)}</Text>
							</View>
						</View>

						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Tipo de Bloqueo:</Text>
								<Text style={styles.value}>
									{getLockoutTypeLabel(lockoutPermit.lockoutType)}
									{lockoutPermit.lockoutTypeOther && ` (${lockoutPermit.lockoutTypeOther})`}
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Empresa:</Text>
								<Text style={styles.value}>{lockoutPermit.company.name}</Text>
							</View>
						</View>

						<View style={styles.column}>
							<View style={styles.row}>
								<Text style={styles.label}>Solicitado por:</Text>
								<Text style={styles.value}>{lockoutPermit.requestedBy.name}</Text>
							</View>
						</View>
					</View>

					{lockoutPermit.otNumberRef && (
						<View style={styles.row}>
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>Orden de Trabajo:</Text>
									<Text style={styles.value}>{lockoutPermit.otNumberRef.otNumber}</Text>
								</View>
							</View>
							{lockoutPermit.otNumberRef.workRequest && (
								<View style={styles.column}>
									<View style={styles.row}>
										<Text style={styles.label}>Solicitud:</Text>
										<Text style={styles.value}>{lockoutPermit.otNumberRef.workRequest}</Text>
									</View>
								</View>
							)}
						</View>
					)}

					{lockoutPermit.supervisor && (
						<View style={styles.row}>
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>Supervisor:</Text>
									<Text style={styles.value}>{lockoutPermit.supervisor.name}</Text>
								</View>
							</View>
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>RUT Supervisor:</Text>
									<Text style={styles.value}>{lockoutPermit.supervisor.rut}</Text>
								</View>
							</View>
						</View>
					)}

					{lockoutPermit.operator && (
						<View style={styles.row}>
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>Operador:</Text>
									<Text style={styles.value}>{lockoutPermit.operator.name}</Text>
								</View>
							</View>
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>RUT Operador:</Text>
									<Text style={styles.value}>{lockoutPermit.operator.rut}</Text>
								</View>
							</View>
						</View>
					)}
				</View>

				{/* Equipos */}
				{lockoutPermit.equipments.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.subtitle}>2. EQUIPOS A BLOQUEAR</Text>

						<View style={styles.table}>
							<View style={styles.tableRow}>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Equipo</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Tag</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, styles.lastCol]}>
									<Text>Ubicación</Text>
								</View>
							</View>
							{lockoutPermit.equipments.map((equipment, index) => (
								<View style={styles.tableRow} key={index}>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{equipment.name}</Text>
									</View>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{equipment.tag || "-"}</Text>
									</View>
									<View style={[styles.tableCol, styles.lastCol]}>
										<Text style={styles.tableCell}>{equipment.location || "-"}</Text>
									</View>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Actividades */}
				{lockoutPermit.activitiesToExecute.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.subtitle}>3. ACTIVIDADES A EJECUTAR</Text>

						{lockoutPermit.activitiesToExecute.map((activity, index) => (
							<View key={index} style={styles.activityItem}>
								<Text style={styles.activityNumber}>{index + 1}.</Text>
								<Text style={styles.activityText}>{activity}</Text>
							</View>
						))}
					</View>
				)}

				{/* Registros de bloqueo */}
				{lockoutPermit.lockoutRegistrations.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.subtitle}>4. REGISTROS DE BLOQUEO</Text>

						<View style={styles.table}>
							<View style={styles.tableRow}>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Nombre</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>RUT</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>N° Candado</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Instalación</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Retiro</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, styles.lastCol]}>
									<Text>Firma</Text>
								</View>
							</View>
							{lockoutPermit.lockoutRegistrations.map((registration) => (
								<View style={styles.tableRow} key={registration.id}>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{registration.name}</Text>
									</View>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{registration.rut}</Text>
									</View>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{registration.lockNumber}</Text>
									</View>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>
											{registration.installDate
												? `${format(new Date(registration.installDate), "dd/MM/yyyy")} ${registration.installTime || ""}`
												: "Pendiente"}
										</Text>
									</View>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>
											{registration.removeDate
												? `${format(new Date(registration.removeDate), "dd/MM/yyyy")} ${registration.removeTime || ""}`
												: "Pendiente"}
										</Text>
									</View>
									<View style={[styles.tableCol, styles.lastCol]}>
										<Text style={styles.tableCell}></Text>
									</View>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Revisiones de energía cero */}
				{lockoutPermit.zeroEnergyReviews.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.subtitle}>5. REVISIONES DE ENERGÍA CERO</Text>

						<View style={styles.table}>
							<View style={styles.tableRow}>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Equipo</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Ubicación</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Acción</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Realizado por</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader]}>
									<Text>Revisor</Text>
								</View>
								<View style={[styles.tableCol, styles.tableHeader, styles.lastCol]}>
									<Text>Estado</Text>
								</View>
							</View>
							{lockoutPermit.zeroEnergyReviews.map((review) => (
								<View style={styles.tableRow} key={review.id}>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{review.equipment.name}</Text>
									</View>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{review.equipment.location || "-"}</Text>
									</View>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{review.action}</Text>
									</View>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{review.performedBy.name}</Text>
									</View>
									<View style={styles.tableCol}>
										<Text style={styles.tableCell}>{review.reviewer?.name || "-"}</Text>
									</View>
									<View style={[styles.tableCol, styles.lastCol]}>
										<Text style={styles.tableCell}>
											{review.reviewedZero === null
												? "Pendiente"
												: review.reviewedZero
													? "Aprobado"
													: "Rechazado"}
										</Text>
									</View>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Observaciones */}
				<View style={styles.section}>
					<Text style={styles.subtitle}>6. OBSERVACIONES</Text>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Observaciones generales:</Text>
							<View style={styles.customLargeField}>
								<Text>{lockoutPermit.observations || ""}</Text>
							</View>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Observaciones finales del jefe de área:</Text>
							<View style={styles.customLargeField}>
								<Text>{lockoutPermit.finalObservations || ""}</Text>
							</View>
						</View>
					</View>

					{lockoutPermit.approvalNotes && (
						<View style={styles.row}>
							<View style={styles.column}>
								<Text style={styles.label}>Notas de aprobación:</Text>
								<View style={styles.customLargeField}>
									<Text>{lockoutPermit.approvalNotes}</Text>
								</View>
							</View>
						</View>
					)}
				</View>

				{/* Información de aprobación */}
				{lockoutPermit.approved !== null && (
					<View style={styles.section}>
						<Text style={styles.subtitle}>7. INFORMACIÓN DE APROBACIÓN</Text>

						<View style={styles.row}>
							<View style={styles.column}>
								<View style={styles.row}>
									<Text style={styles.label}>Estado de Aprobación:</Text>
									<Text style={styles.value}>
										{lockoutPermit.approved ? "APROBADO" : "RECHAZADO"}
									</Text>
								</View>
							</View>

							{lockoutPermit.approvalDate && (
								<View style={styles.column}>
									<View style={styles.row}>
										<Text style={styles.label}>Fecha de Aprobación:</Text>
										<Text style={styles.value}>
											{format(new Date(lockoutPermit.approvalDate), "dd/MM/yyyy", { locale: es })}
											{lockoutPermit.approvalTime && ` - ${lockoutPermit.approvalTime}`}
										</Text>
									</View>
								</View>
							)}
						</View>
					</View>
				)}

				{/* Sección de firmas */}
				<View style={styles.signatureSection}>
					<View style={styles.signatureColumn}>
						<View style={styles.signatureBox}></View>
						<Text style={styles.signatureLabel}>Firma Solicitante</Text>
						<Text style={styles.signatureLabel}>{lockoutPermit.requestedBy.name}</Text>
					</View>

					<View style={styles.signatureColumn}>
						<View style={styles.signatureBox}></View>
						<Text style={styles.signatureLabel}>Firma Responsable Área</Text>
						<Text style={styles.signatureLabel}>{lockoutPermit.areaResponsible.name}</Text>
					</View>

					<View style={styles.signatureColumn}>
						<View style={styles.signatureBox}></View>
						<Text style={styles.signatureLabel}>Firma Supervisor OTC</Text>
						<Text style={styles.signatureLabel}>{lockoutPermit.supervisor?.name || ""}</Text>
					</View>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<Text>
						PERMISO DE BLOQUEO - Este documento debe ser impreso y firmado físicamente. Documento
						generado el {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
					</Text>
				</View>
			</Page>
		</Document>
	)
}

export default LockoutPermitPDF
