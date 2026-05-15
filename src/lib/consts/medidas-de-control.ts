export interface MedidaDeControl {
	id: string
	label: string
	category: string
	hasSpecification?: boolean
}

export const MEDIDAS_DE_CONTROL_CATEGORY_LABELS: Record<string, string> = {
	generales: "Generales",
	control_de_energias: "Control de Energías",
	atmosferas_peligrosas: "Atmósferas Peligrosas",
	trabajo_en_caliente: "Trabajo en Caliente",
	excavaciones: "Excavaciones",
	trabajo_en_altura: "Trabajo en Altura",
	izaje: "Izaje",
	vehiculos_y_maquinaria: "Vehículos y Maquinaria",
	sustancias_peligrosas: "Sustancias Peligrosas",
	epp: "EPP",
	condiciones_ambientales: "Condiciones Ambientales",
	otras: "Otras",
}

export const MEDIDAS_DE_CONTROL: MedidaDeControl[] = [
	// generales
	{ id: "CG01", label: "Permiso de trabajo aprobado", category: "generales" },
	{ id: "CG02", label: "AST / ART realizado y difundido", category: "generales" },
	{ id: "CG03", label: "Charla de seguridad previa", category: "generales" },
	{ id: "CG04", label: "Personal competente y autorizado", category: "generales" },
	{ id: "CG05", label: "Supervisión permanente", category: "generales" },
	{ id: "CG06", label: "Delimitación y señalización del área", category: "generales" },
	{ id: "CG07", label: "Orden y aseo", category: "generales" },
	{ id: "CG08", label: "Comunicación operativa (radio/teléfono)", category: "generales" },
	{ id: "CG09", label: "Plan de emergencia difundido", category: "generales" },
	{ id: "CG10", label: "Vías de evacuación identificadas", category: "generales" },
	// control_de_energias
	{ id: "CE01", label: "Bloqueo y etiquetado (LOTO)", category: "control_de_energias" },
	{ id: "CE02", label: "Verificación de ausencia de energía", category: "control_de_energias" },
	{ id: "CE03", label: "Despresurización y drenaje de líneas", category: "control_de_energias" },
	{ id: "CE04", label: "Aislamiento mecánico de equipos", category: "control_de_energias" },
	// atmosferas_peligrosas
	{ id: "CA01", label: "Medición de gases", category: "atmosferas_peligrosas" },
	{ id: "CA02", label: "Ventilación forzada/natural", category: "atmosferas_peligrosas" },
	{ id: "CA03", label: "Uso de detector portátil", category: "atmosferas_peligrosas" },
	{ id: "CA04", label: "Vigía permanente (si aplica)", category: "atmosferas_peligrosas" },
	// trabajo_en_caliente
	{ id: "CC01", label: "Permiso de trabajo en caliente", category: "trabajo_en_caliente" },
	{ id: "CC02", label: "Retiro de materiales combustibles", category: "trabajo_en_caliente" },
	{ id: "CC03", label: "Extintores disponibles", category: "trabajo_en_caliente" },
	{ id: "CC04", label: "Vigía de fuego", category: "trabajo_en_caliente" },
	{ id: "CC05", label: "Uso de equipos anti-chispa (si aplica)", category: "trabajo_en_caliente" },
	// excavaciones
	{ id: "CX01", label: "Permiso de excavación", category: "excavaciones" },
	{ id: "CX02", label: "Detección y marcación de interferencias", category: "excavaciones" },
	{ id: "CX03", label: "Calicata previa", category: "excavaciones" },
	{ id: "CX04", label: "Excavación manual en zona crítica", category: "excavaciones" },
	{ id: "CX05", label: "Entibación o talud seguro", category: "excavaciones" },
	// trabajo_en_altura
	{ id: "CH01", label: "Permiso de trabajo en altura", category: "trabajo_en_altura" },
	{ id: "CH02", label: "Sistema anticaídas", category: "trabajo_en_altura" },
	{ id: "CH03", label: "Puntos de anclaje certificados", category: "trabajo_en_altura" },
	{ id: "CH04", label: "Inspección de andamios/escalas", category: "trabajo_en_altura" },
	// izaje
	{ id: "CI01", label: "Plan de izaje aprobado", category: "izaje" },
	{ id: "CI02", label: "Operador y rigger certificados", category: "izaje" },
	{ id: "CI03", label: "Inspección de eslingas y accesorios", category: "izaje" },
	{ id: "CI04", label: "Área segregada", category: "izaje" },
	// vehiculos_y_maquinaria
	{ id: "CV01", label: "Checklist de equipos", category: "vehiculos_y_maquinaria" },
	{ id: "CV02", label: "Señalización de tránsito", category: "vehiculos_y_maquinaria" },
	{ id: "CV03", label: "Uso de cinturón de seguridad", category: "vehiculos_y_maquinaria" },
	{ id: "CV04", label: "Control de velocidad", category: "vehiculos_y_maquinaria" },
	{ id: "CV05", label: "Vigía en maniobras", category: "vehiculos_y_maquinaria" },
	// sustancias_peligrosas
	{ id: "CS01", label: "Hojas de seguridad (HDS) disponibles", category: "sustancias_peligrosas" },
	{ id: "CS02", label: "Rotulación de envases", category: "sustancias_peligrosas" },
	{ id: "CS03", label: "Bandejas de contención", category: "sustancias_peligrosas" },
	{ id: "CS04", label: "Kit de derrames disponible", category: "sustancias_peligrosas" },
	{ id: "CS05", label: "Almacenamiento segregado", category: "sustancias_peligrosas" },
	// epp
	{ id: "EP01", label: "Casco de seguridad", category: "epp" },
	{ id: "EP02", label: "Lentes de seguridad", category: "epp" },
	{ id: "EP03", label: "Guantes adecuados", category: "epp" },
	{ id: "EP04", label: "Calzado de seguridad", category: "epp" },
	{ id: "EP05", label: "Protección auditiva", category: "epp" },
	{ id: "EP06", label: "Protección respiratoria (según tarea)", category: "epp" },
	{ id: "EP07", label: "Protección facial", category: "epp" },
	{ id: "EP08", label: "EPP dieléctrico (si aplica)", category: "epp" },
	// condiciones_ambientales
	{ id: "CM01", label: "Hidratación disponible", category: "condiciones_ambientales" },
	{ id: "CM02", label: "Protección solar", category: "condiciones_ambientales" },
	{ id: "CM03", label: "Ropa adecuada a clima", category: "condiciones_ambientales" },
	{
		id: "CM04",
		label: "Suspensión de trabajo en condiciones extremas",
		category: "condiciones_ambientales",
	},
	// otras
	{ id: "CO01", label: "Otra", category: "otras", hasSpecification: true },
]

export const MEDIDA_OTRA_ID = "CO01"

export const MedidasDeControlOptions: { value: string; label: string; group: string }[] =
	MEDIDAS_DE_CONTROL.map((m) => ({
		value: m.id,
		label: m.label,
		group: MEDIDAS_DE_CONTROL_CATEGORY_LABELS[m.category] ?? m.category,
	}))

export const MEDIDAS_MAP = new Map(MEDIDAS_DE_CONTROL.map((m) => [m.id, m.label]))

export function getMedidaDeControlLabel(id: string): string {
	return MEDIDAS_MAP.get(id) ?? id
}
