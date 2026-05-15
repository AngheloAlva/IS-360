"use client"

import { FileTextIcon, ExternalLinkIcon } from "lucide-react"

import { useGuideDocuments } from "../../hooks/use-guide-documents"
import type { StartupGuideDocumentVisibility } from "@/generated/prisma/enums"

import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"

interface GuideDocumentsViewProps {
	folderType: "BASIC" | "FULL"
}

export function GuideDocumentsView({ folderType }: GuideDocumentsViewProps) {
	const { data: documents, isLoading } = useGuideDocuments({
		visibility: folderType as StartupGuideDocumentVisibility,
	})

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-4 w-64" />
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{[1, 2].map((i) => (
							<Skeleton key={i} className="h-16 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!documents || documents.length === 0) {
		return null
	}

	return (
		<Card className="border-teal-500/20 bg-teal-500/5">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base text-teal-600">
					<FileTextIcon className="h-4 w-4" />
					Documentos de Guía
				</CardTitle>
				<CardDescription>
					Documentos importantes que debes revisar para completar tu carpeta de arranque
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-2 md:grid-cols-2">
					{documents.map((doc) => (
						<a
							key={doc.id}
							href={doc.url}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-background hover:bg-accent flex items-center gap-3 rounded-lg border p-3 transition-colors"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
								<FileTextIcon className="h-5 w-5 text-teal-600" />
							</div>
							<div className="flex-1 overflow-hidden">
								<p className="truncate font-semibold">{doc.name}</p>
								{doc.description && (
									<p className="text-muted-foreground truncate text-sm">{doc.description}</p>
								)}
							</div>
							<Button variant="ghost" size="icon" className="shrink-0">
								<ExternalLinkIcon className="h-4 w-4" />
							</Button>
						</a>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
