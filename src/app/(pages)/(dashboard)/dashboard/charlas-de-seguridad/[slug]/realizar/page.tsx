import { notFound, redirect } from "next/navigation"
import Link from "next/link"

import { getSafetyTalkBySlug } from "@/actions/safety-talks/get-safety-talks"
import { SafetyTalkExam } from "@/components/sections/safety-talks/SafetyTalkExam"
import { Button } from "@/components/ui/button"

export default async function TakeSafetyTalkPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	const safetyTalk = await getSafetyTalkBySlug(slug)

	if (!safetyTalk) {
		notFound()
	}

	// Si la charla es presencial, no se puede realizar en línea
	if (safetyTalk.isPresential) {
		redirect(`/dashboard/charlas-de-seguridad/${slug}`)
	}

	// Mapear las preguntas al formato esperado por el componente
	const questions = safetyTalk.questions.map((question) => ({
		id: question.id,
		type: question.type,
		question: question.question,
		imageUrl: question.imageUrl,
		description: question.description,
		options: question.options.map((option) => ({
			id: option.id,
			text: option.text,
			isCorrect: option.isCorrect,
			zoneLabel: option.zoneLabel,
			zoneId: option.zoneId,
			order: option.order,
		})),
	}))

	return (
		<div className="space-y-6">
			{safetyTalk.questions.length === 0 ? (
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
					safetyTalkId={safetyTalk.id}
					title={safetyTalk.title}
					description={safetyTalk.description}
					minimumScore={safetyTalk.minimumScore}
					timeLimit={safetyTalk.timeLimit}
					questions={questions}
				/>
			)}
		</div>
	)
}
