export type QuestionType = "single" | "matching" | "image-labels"

export interface Question {
	id: number
	text: string
	type: QuestionType
	options?: { id: string; text: string }[]
	matchingPairs?: {
		question: string
		options: { id: string; text: string }[]
		correctId: string
	}[]
	imageLabels?: { id: string; label: string }[]
	correctAnswer: string | string[]
}

export const environmentalQuestions: Question[] = [
	{
		id: 1,
		text: "Cuando se realiza una actividad en Oleoducto Trasandino que genera residuos, ya sean peligrosos o no peligrosos, cómo debería proceder:",
		type: "single",
		options: [
			{ id: "a", text: "Empacarlos correctamente y disponerlos fuera de la planta." },
			{
				id: "b",
				text: "Disponerlo en las Bodegas/Tolvas correspondiente dentro de las Instalaciones de Oleoducto Trasandino.",
			},
			{
				id: "c",
				text: "Informar al Inspector de Medio Ambiente tipo y cantidad de residuos generados, posteriormente, disponerlo en las Bodegas/Tolvas correspondiente dentro de las Instalaciones de Oleoducto Trasandino.",
			},
		],
		correctAnswer: "c",
	},
	{
		id: 2,
		text: "En el caso de la Basura domiciliaria:",
		type: "single",
		options: [
			{
				id: "a",
				text: "Debo disponerla en una bolsa adecuada y trasladarla hasta mis instalaciones",
			},
			{
				id: "b",
				text: "Debe disponerla en la Tolva de Basura Asimilable, cada vez que la genere.",
			},
			{ id: "c", text: "Esta prohíbo disponer basura domiciliaria en OTC" },
		],
		correctAnswer: "c",
	},
	{
		id: 3,
		text: "En Oleoducto Trasandino, cuenta con un punto limpio, en donde se reciclan:",
		type: "single",
		options: [
			{ id: "a", text: "Cartones-Botellas Plásticas-Botellas de Vidrios-Latas de Aluminio" },
			{ id: "b", text: "Solo Botellas Plásticas" },
			{ id: "c", text: "Solo Latas de Aluminio" },
		],
		correctAnswer: "a",
	},
	{
		id: 4,
		text: "Para poder ejecutar cualquier servicio, debe contar con la autorización del Departamento de Medio Ambiente, este departamento considera:",
		type: "single",
		options: [
			{
				id: "a",
				text: "La documentación de Carpeta de Arranque MA y Charla de Inducción deben estar aprobadas",
			},
			{ id: "b", text: "Solo basta con que la Charla de Inducción esté aprobada" },
			{ id: "c", text: "Sólo basta con que mi documentación esté aprobada." },
		],
		correctAnswer: "a",
	},
	{
		id: 5,
		text: "Selecciona el destino correcto para cada tipo de residuo:",
		type: "matching",
		matchingPairs: [
			{
				question: "Tolva de Basura Asimilable",
				options: [
					{ id: "1", text: "Botella Desechable" },
					{ id: "2", text: "Envase de solvente (aceite-diluyente, etc)" },
					{ id: "3", text: "Residuos de construcción no contaminados" },
					{ id: "4", text: "Envases de Colación" },
				],
				correctId: "4",
			},
			{
				question: "Punto Limpio",
				options: [
					{ id: "1", text: "Botella Desechable" },
					{ id: "2", text: "Envase de solvente (aceite-diluyente, etc)" },
					{ id: "3", text: "Residuos de construcción no contaminados" },
					{ id: "4", text: "Envases de Colación" },
				],
				correctId: "1",
			},
			{
				question: "Bodega de Residuos Peligrosos",
				options: [
					{ id: "1", text: "Botella Desechable" },
					{ id: "2", text: "Envase de solvente (aceite-diluyente, etc)" },
					{ id: "3", text: "Residuos de construcción no contaminados" },
					{ id: "4", text: "Envases de Colación" },
				],
				correctId: "2",
			},
			{
				question: "Tolva de Residuos No Peligrosos",
				options: [
					{ id: "1", text: "Botella Desechable" },
					{ id: "2", text: "Envase de solvente (aceite-diluyente, etc)" },
					{ id: "3", text: "Residuos de construcción no contaminados" },
					{ id: "4", text: "Envases de Colación" },
				],
				correctId: "3",
			},
		],
		correctAnswer: ["4", "1", "2", "3"],
	},
	{
		id: 6,
		text: "6.	En cuanto a los residuos Peligrosos, como se realiza una correcta paletización:",
		type: "single",
		options: [
			{ id: "a", text: "Se apila correctamente en la Bodega de Residuos Peligrosos" },
			{
				id: "b",
				text: "El residuo peligroso de un mismo tipo debe quedar correctamente apilado sobre un pallet de madera, posteriormente hermetizar y rotular.",
			},
			{
				id: "c",
				text: "El residuo peligroso de cualquier tipo debe quedar correctamente apilado sobre un pallet de madera, posteriormente hermetizar y rotular.",
			},
		],
		correctAnswer: "b",
	},
	{
		id: 7,
		text: "7. La Matriz de Aspectos e Impactos Ambientales, identifica:",
		type: "single",
		options: [
			{ id: "a", text: "Los riesgos asociados a Salud Ocupacional y al medio ambiente" },
			{ id: "b", text: "Los impactos ambientales que puede provocar una actividad al humedal" },
			{
				id: "c",
				text: "…evalúa y controla los impactos ambientales de una determinada actividad o proyecto.",
			},
		],
		correctAnswer: "c",
	},
	{
		id: 8,
		text: "8. Los trabajos que se realizan en el Emplazamiento de los ductos 16” y/o 30”, no requieren requisitos de Medio Ambiente",
		type: "single",
		options: [
			{ id: "a", text: "Esta afirmación es falsa" },
			{ id: "b", text: "Esta afirmación es verdadera" },
			{
				id: "c",
				text: "Esta afirmación es verdadera, siempre y cuando tenga un permiso de trabajo.",
			},
		],
		correctAnswer: "a",
	},
	{
		id: 9,
		text: "9. Cuando realizo una actividad y esta produce un derrame en suelo o en agua, debo proceder de la siguiente manera:",
		type: "single",
		options: [
			{
				id: "a",
				text: "Usar como primera respuesta mi Kits en caso de derrame-Reportar el incidente al Inspector de Medio Ambiente, entregando toda la información necesaria para controlar la situación.",
			},
			{ id: "b", text: "Si el derrame es en suelo, no es necesario realizar ninguna acción." },
			{
				id: "c",
				text: "Usar como primera respuesta mi Kits en caso de derrame sólo en caso de que el derrame ocurra en agua.",
			},
		],
		correctAnswer: "a",
	},
]

export function scoreEnvironmentalAnswers(
	answers: { questionId: number; answer: string }[]
): number {
	const totalQuestions = environmentalQuestions.length
	const pointsPerQuestion = 100 / totalQuestions
	let score = 0

	answers.forEach((answer) => {
		const question = environmentalQuestions.find((q) => q.id === answer.questionId)
		if (!question) return

		if (question.type === "matching") {
			// For matching questions, count each correct match
			const userMatches = answer.answer.split(",")
			const correctMatches = question.correctAnswer as string[]
			const correctCount = userMatches.filter((match) => correctMatches.includes(match)).length
			const totalMatches = correctMatches.length
			score += (correctCount / totalMatches) * pointsPerQuestion
		} else {
			// For single choice questions, it's all or nothing
			if (answer.answer === question.correctAnswer) {
				score += pointsPerQuestion
			}
		}
	})

	return Math.round(score * 10) / 10 // Round to 1 decimal place
}
