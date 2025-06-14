import { notFound } from "next/navigation"

import { getSafetyTalkBySlug } from "@/features/safety-talk/actions/get-safety-talks"

import EditSafetyTalkForm from "@/features/safety-talk/components/forms/EditSafetyTalkForm"
import BackButton from "@/shared/components/BackButton"

interface EditSafetyTalkPageProps {
	params: Promise<{
		slug: string
	}>
}

export default async function EditSafetyTalkPage({
	params,
}: EditSafetyTalkPageProps): Promise<React.ReactElement> {
	const { slug } = await params
	const safetyTalkData = await getSafetyTalkBySlug(slug)

	if (!safetyTalkData) {
		notFound()
	}

	const safetyTalk = {
		id: safetyTalkData.id,
		title: safetyTalkData.title,
		slug: safetyTalkData.slug,
		description: safetyTalkData.description,
		isPresential: safetyTalkData.isPresential,
		expiresAt: safetyTalkData.expiresAt,
		timeLimit: safetyTalkData.timeLimit,
		minimumScore: safetyTalkData.minimumScore,
		questions: safetyTalkData.questions.map((q) => ({
			id: q.id,
			type: q.type as string,
			question: q.question,
			imageUrl: q.imageUrl,
			description: q.description,
			options: q.options.map((o) => ({
				id: o.id,
				text: o.text,
				isCorrect: o.isCorrect,
				zoneLabel: o.zoneLabel,
				zoneId: o.zoneId,
				order: o.order,
			})),
		})),
		resources: safetyTalkData.resources.map((r) => ({
			id: r.id,
			title: r.title,
			type: r.type as string,
			url: r.url,
			fileSize: r.fileSize ?? 0, // Aseguramos que nunca sea null
			mimeType: r.mimeType ?? "", // Aseguramos que nunca sea null
		})),
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-center justify-start gap-2">
				<BackButton href="/admin/dashboard/charlas-de-seguridad" />
				<div>
					<h1 className="w-fit text-3xl font-bold">Editar Charla de Seguridad</h1>
					<p className="text-muted-foreground">
						Edita los detalles, recursos y preguntas de la charla de seguridad.
					</p>
				</div>
			</div>

			<EditSafetyTalkForm safetyTalk={safetyTalk} />
		</div>
	)
}
