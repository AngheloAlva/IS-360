export interface Peligro {
	id: string
	label: string
	hasSpecification?: boolean
}

export const PELIGROS: Peligro[] = [
	{ id: "P01", label: "Presencia de hidrocarburos líquidos" },
	{ id: "P02", label: "Presencia de vapores inflamables / gases combustibles" },
	{ id: "P03", label: "Atmósferas peligrosas (deficiencia de oxígeno / gases tóxicos)" },
	{ id: "P04", label: "Energía eléctrica (tableros, líneas, equipos energizados)" },
	{ id: "P05", label: "Energía mecánica (partes móviles, equipos en movimiento)" },
	{ id: "P06", label: "Energía hidráulica / neumática / presión residual" },
	{ id: "P07", label: "Intervención de líneas o equipos presurizados" },
	{ id: "P08", label: "Excavación / interferencia con instalaciones enterradas" },
	{ id: "P09", label: "Terreno irregular / zanjas / desniveles" },
	{ id: "P10", label: "Trabajo en altura (andamios, escalas, plataformas)" },
	{ id: "P11", label: "Caídas al mismo nivel (superficies resbalosas, desorden)" },
	{ id: "P12", label: "Caídas a distinto nivel" },
	{ id: "P13", label: "Herramientas manuales (cortes, golpes)" },
	{ id: "P14", label: "Herramientas eléctricas (proyección de partículas, contacto eléctrico)" },
	{ id: "P15", label: "Trabajos en caliente (soldadura, corte, esmerilado)" },
	{ id: "P16", label: "Fuentes de ignición (chispas, llamas, equipos)" },
	{ id: "P17", label: "Izaje de cargas / cargas suspendidas" },
	{ id: "P18", label: "Equipos y maquinaria pesada (retroexcavadora, grúa, etc.)" },
	{ id: "P19", label: "Tránsito de vehículos (interno o externo)" },
	{ id: "P20", label: "Manipulación manual de cargas" },
	{ id: "P21", label: "Sustancias peligrosas (combustibles, químicos, lubricantes)" },
	{ id: "P22", label: "Derrames de hidrocarburos o químicos" },
	{ id: "P23", label: "Almacenamiento de sustancias peligrosas" },
	{ id: "P24", label: "Material particulado / polvo" },
	{ id: "P25", label: "Ruido" },
	{ id: "P26", label: "Vibraciones" },
	{ id: "P27", label: "Condiciones climáticas (lluvia, viento, calor, frío)" },
	{ id: "P28", label: "Radiación solar" },
	{ id: "P29", label: "Fauna / insectos / animales" },
	{ id: "P30", label: "Espacios confinados" },
	{ id: "P31", label: "Trabajo simultáneo con otros contratistas" },
	{ id: "P32", label: "Falta de orden y aseo" },
	{ id: "P33", label: "Fatiga / distracción / error humano" },
	{ id: "P34", label: "Emergencias (incendio, explosión, fuga)" },
	{ id: "P35", label: "Otra", hasSpecification: true },
]

export const PELIGRO_OTRA_ID = "P35"

export const PeligrosOptions: { value: string; label: string }[] = PELIGROS.map((p) => ({
	value: p.id,
	label: p.label,
}))

export const PELIGROS_MAP = new Map(PELIGROS.map((p) => [p.id, p.label]))

export function getPeligroLabel(id: string): string {
	return PELIGROS_MAP.get(id) ?? id
}
