import { notFound, redirect } from "next/navigation"

import { getSafetyTalkByCategory } from "@/project/safety-talk/actions/get-safety-talks"
import { environmentalQuestions } from "@/project/safety-talk/utils/environmental-questions"
import { irlQuestions } from "@/project/safety-talk/utils/irl-questions"

export default async function TakeSafetyTalkPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const category = slug === "environmental" ? "ENVIRONMENT" : "IRL"
	const userSafetyTalk = await getSafetyTalkByCategory(category as "ENVIRONMENT" | "IRL")

	const safetyTalkInfo = {
		environmental: {
			title: "Medio Ambiente",
			description: "Charla sobre prácticas ambientales y manejo de residuos",
			minScore: 70,
			questions: environmentalQuestions,
		},
		irl: {
			title: "Introducción a Riesgos Laborales",
			description: "Charla sobre riesgos laborales básicos y prevención",
			minScore: 70,
			questions: irlQuestions,
		},
	}[slug]

	if (!safetyTalkInfo) {
		notFound()
	}

	// Si el usuario ya tiene un intento en progreso o está bloqueado, redirigir
	if (userSafetyTalk?.status === "IN_PROGRESS" || userSafetyTalk?.status === "BLOCKED") {
		redirect(`/dashboard/charlas-de-seguridad/${slug}`)
	}

	// Si el usuario tiene intentos fallidos, verificar si puede intentar de nuevo
	if (userSafetyTalk?.status === "FAILED" && userSafetyTalk.nextAttemptAt) {
		const nextAttemptDate = new Date(userSafetyTalk.nextAttemptAt)
		if (nextAttemptDate > new Date()) {
			redirect(`/dashboard/charlas-de-seguridad/${slug}`)
		}
	}

	return (
		<div className="space-y-6">
			{/* {safetyTalkInfo.questions.length === 0 ? (
				<div className="rounded-lg border p-8 text-center">
					<h2 className="mb-4 text-xl font-semibold">No hay preguntas disponibles</h2>
					<p className="text-muted-foreground mb-6">
						Esta charla de seguridad no tiene preguntas configuradas. Por favor, contacta al
						administrador.
					</p>
					<Button asChild>
						<Link href="/dashboard/charlas-de-seguridad">Volver al listado</Link>
					</Button>
				</div>
			) : (
				<SafetyTalkExam
					category={category as "ENVIRONMENT" | "IRL"}
					title={safetyTalkInfo.title}
					description={safetyTalkInfo.description}
					minimumScore={safetyTalkInfo.minScore}
					timeLimit={30}
					questions={safetyTalkInfo.questions}
				/>
			)} */}
		</div>
	)
}
