import { notFound, redirect } from "next/navigation"
import Link from "next/link"

import { environmentalQuestions } from "@/project/safety-talk/utils/environmental-questions"
import { getSafetyTalkByCategory } from "@/project/safety-talk/actions/get-safety-talks"

import { SafetyTalkExam } from "@/project/safety-talk/components/SafetyTalkExam"
import { Button } from "@/shared/components/ui/button"

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
			questions: [],
		},
	}[slug]

	if (!safetyTalkInfo) {
		notFound()
	}

	if (userSafetyTalk?.status === "FAILED" && userSafetyTalk.nextAttemptAt) {
		const nextAttemptDate = new Date(userSafetyTalk.nextAttemptAt)
		if (nextAttemptDate > new Date()) {
			redirect(`/dashboard/charlas-de-seguridad/${slug}`)
		}
	}

	return (
		<div className="w-full max-w-screen-lg space-y-6">
			{safetyTalkInfo.questions.length === 0 ? (
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
			)}
		</div>
	)
}
