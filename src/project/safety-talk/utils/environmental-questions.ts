export type QuestionType = 'single' | 'matching' | 'image-labels'

export interface Question {
  id: number
  text: string
  type: QuestionType
  options?: { id: string; text: string }[]
  matchingPairs?: { left: { id: string; text: string }; right: { id: string; text: string } }[]
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
      { id: "b", text: "Disponerlo en las Bodegas/Tolvas correspondiente dentro de las Instalaciones de Oleoducto Trasandino." },
      { id: "c", text: "Informar al Inspector de Medio Ambiente tipo y cantidad de residuos generados, posteriormente, disponerlo en las Bodegas/Tolvas correspondiente dentro de las Instalaciones de Oleoducto Trasandino." }
    ],
    correctAnswer: "c"
  },
  {
    id: 2,
    text: "En el caso de la Basura domiciliaria:",
    type: "single",
    options: [
      { id: "a", text: "Debo disponerla en una bolsa adecuada y trasladarla hasta mis instalaciones" },
      { id: "b", text: "Debe disponerla en la Tolva de Basura Asimilable, cada vez que la genere." },
      { id: "c", text: "Esta prohíbo disponer basura domiciliaria en OTC" }
    ],
    correctAnswer: "c"
  },
  {
    id: 3,
    text: "En Oleoducto Trasandino, cuenta con un punto limpio, en donde se reciclan:",
    type: "single",
    options: [
      { id: "a", text: "Cartones-Botellas Plásticas-Botellas de Vidrios-Latas de Aluminio" },
      { id: "b", text: "Solo Botellas Plásticas" },
      { id: "c", text: "Solo Latas de Aluminio" }
    ],
    correctAnswer: "a"
  },
  {
    id: 4,
    text: "Para poder ejecutar cualquier servicio, debe contar con la autorización del Departamento de Medio Ambiente, este departamento considera:",
    type: "single",
    options: [
      { id: "a", text: "La documentación de Carpeta de Arranque MA y Charla de Inducción deben estar aprobadas" },
      { id: "b", text: "Solo basta con que la Charla de Inducción esté aprobada" },
      { id: "c", text: "Sólo basta con que mi documentación esté aprobada." }
    ],
    correctAnswer: "a"
  },
  {
    id: 5,
    text: "Relaciones los siguientes Residuos y su correcta segregación.",
    type: "matching",
    matchingPairs: [
      { 
        left: { id: "1", text: "Botella Desechable" },
        right: { id: "A", text: "Tolva de Basura Asimilable" }
      },
      {
        left: { id: "2", text: "Envase de solvente (aceite-diluyente, etc)" },
        right: { id: "B", text: "Punto Limpio" }
      },
      {
        left: { id: "3", text: "Residuos de construcción no contaminados" },
        right: { id: "C", text: "Bodega de Residuos Peligrosos" }
      },
      {
        left: { id: "4", text: "Envases de Colación" },
        right: { id: "D", text: "Tolva de Residuos No Peligrosos" }
      }
    ],
    correctAnswer: ["1B", "2C", "3D", "4A"]
  }
]

export function scoreEnvironmentalAnswers(answers: { questionId: number; answer: string }[]): number {
  const totalQuestions = environmentalQuestions.length
  const pointsPerQuestion = 100 / totalQuestions
  let score = 0

  answers.forEach(answer => {
    const question = environmentalQuestions.find(q => q.id === answer.questionId)
    if (!question) return

    if (question.type === "matching") {
      // For matching questions, count each correct match
      const userMatches = answer.answer.split(",")
      const correctMatches = question.correctAnswer as string[]
      const correctCount = userMatches.filter(match => correctMatches.includes(match)).length
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
