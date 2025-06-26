import { type Question } from "./environmental-questions"

export const irlQuestions: Question[] = [
  {
    id: 1,
    text: "¿Cuál es el primer paso que debe tomar al llegar a su área de trabajo?",
    type: "single",
    options: [
      { id: "a", text: "Comenzar a trabajar inmediatamente" },
      { id: "b", text: "Identificar los riesgos y peligros del área" },
      { id: "c", text: "Ponerse el equipo de protección personal" }
    ],
    correctAnswer: "b"
  },
  {
    id: 2,
    text: "¿Qué debe hacer si observa una condición insegura?",
    type: "single",
    options: [
      { id: "a", text: "Ignorarla si no afecta directamente su trabajo" },
      { id: "b", text: "Reportarla inmediatamente a su supervisor" },
      { id: "c", text: "Tratar de arreglarla usted mismo" }
    ],
    correctAnswer: "b"
  },
  {
    id: 3,
    text: "El uso de EPP (Equipo de Protección Personal) es:",
    type: "single",
    options: [
      { id: "a", text: "Opcional dependiendo de la tarea" },
      { id: "b", text: "Obligatorio solo en áreas de alto riesgo" },
      { id: "c", text: "Obligatorio en todas las áreas operativas" }
    ],
    correctAnswer: "c"
  },
  {
    id: 4,
    text: "En caso de emergencia, usted debe:",
    type: "single",
    options: [
      { id: "a", text: "Seguir las rutas de evacuación señalizadas" },
      { id: "b", text: "Usar el ascensor para evacuar rápidamente" },
      { id: "c", text: "Continuar trabajando hasta recibir instrucciones" }
    ],
    correctAnswer: "a"
  },
  {
    id: 5,
    text: "Relacione los siguientes EPP con su función principal de protección:",
    type: "matching",
    matchingPairs: [
      {
        left: { id: "1", text: "Casco" },
        right: { id: "A", text: "Protección contra caídas de objetos" }
      },
      {
        left: { id: "2", text: "Guantes" },
        right: { id: "B", text: "Protección de las manos contra cortes y químicos" }
      },
      {
        left: { id: "3", text: "Protector auditivo" },
        right: { id: "C", text: "Protección contra ruidos fuertes" }
      },
      {
        left: { id: "4", text: "Zapatos de seguridad" },
        right: { id: "D", text: "Protección contra impactos y aplastamiento" }
      }
    ],
    correctAnswer: ["1A", "2B", "3C", "4D"]
  }
]

export function scoreIRLAnswers(answers: { questionId: number; answer: string }[]): number {
  const totalQuestions = irlQuestions.length
  const pointsPerQuestion = 100 / totalQuestions
  let score = 0

  answers.forEach(answer => {
    const question = irlQuestions.find(q => q.id === answer.questionId)
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
