import { InfoIcon } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { extractFilenameFromUrl, openDocumentSecurely } from "@/lib/view-document"
import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/shared/components/ui/card"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import DeleteConfirmationDialog from "../forms/DeleteConfirmationDialog"
import { UpdateFileFormSheet } from "../forms/UpdateFileFormSheet"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import FileComments from "./FileComments"

import type { File } from "../../hooks/use-documents"
import type { AREAS } from "@prisma/client"

export default function FileExplorerItem({
	item,
	icon,
	userId,
	canEdit,
	areaValue,
}: {
	item: File
	userId: string
	areaValue: AREAS
	canEdit: boolean
	icon: React.ReactNode
}): React.ReactElement {
	const [isLoadingResource, setIsLoadingResource] = useState(false)

	const handleViewDocument = async (file: File) => {
		const filename = extractFilenameFromUrl(file.url)

		if (!filename) {
			toast.error("No se pudo determinar el nombre del archivo")
			return
		}

		setIsLoadingResource(true)
		await openDocumentSecurely(filename, "documents")
		setIsLoadingResource(false)
	}

	return (
		<Card key={item.id} className="relative max-w-full overflow-hidden">
			{isLoadingResource && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/40">
					<Spinner />
				</div>
			)}

			<CardContent className="flex h-full flex-col justify-between gap-2">
				<div className="flex items-center gap-2">
					{icon}

					<button
						rel="noreferrer noopener"
						className="pr-12 text-left font-medium hover:underline"
						onClick={() => handleViewDocument(item)}
					>
						{item?.code ? item.code.charAt(0) + "-" + item.name : item.name}
					</button>
				</div>

				{item.description && (
					<p className="text-muted-foreground line-clamp-2 text-sm">{item.description}</p>
				)}

				<div className="text-muted-foreground flex items-center justify-end gap-2 text-xs">
					<span>{item.revisionCount} revisiones</span>
					<span>•</span>
					<span
						className={cn(
							"rounded-full px-2 py-1 font-semibold",
							item.expirationDate && item.expirationDate < new Date()
								? "bg-red-500/10 text-red-500"
								: "bg-green-500/10 text-green-500"
						)}
					>
						{item.expirationDate
							? item.expirationDate < new Date()
								? "Expirado"
								: "Vigente"
							: "Vigente"}
					</span>
				</div>

				<div className="absolute top-4 right-4 flex gap-1">
					<FileComments fileId={item.id} comments={item.comments} userId={userId} />

					<Popover>
						<PopoverTrigger asChild>
							<Button size="icon" className="bg-primary/20 text-text hover:bg-primary h-8 w-8">
								<InfoIcon className="h-4 w-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-80">
							<div className="grid gap-2">
								<div className="space-y-1">
									<h4 className="font-medium">Información del archivo</h4>
									<div className="grid gap-1">
										<p className="text-muted-foreground text-sm">
											Creado por: <span className="font-semibold">{item.user?.name}</span>
										</p>
										<p className="text-muted-foreground text-sm">
											Fecha de registro:{" "}
											<span className="font-semibold">
												{format(item.registrationDate, "dd/MM/yyyy")}
											</span>
										</p>
										<p className="text-muted-foreground text-sm">
											Fecha de expiración:{" "}
											{item.expirationDate ? (
												<span className="font-semibold">
													{format(item.expirationDate, "dd/MM/yyyy")}
												</span>
											) : (
												"N/A"
											)}
										</p>
										<p className="text-muted-foreground text-sm">
											Última actualización:{" "}
											<span className="font-semibold">{format(item.updatedAt, "dd/MM/yyyy")}</span>
										</p>
									</div>
								</div>

								{canEdit && (
									<div className="mt-4 flex gap-2">
										<UpdateFileFormSheet
											userId={userId}
											fileId={item.id}
											initialData={item}
											areaValue={areaValue}
											parentFolderId={item.folderId || undefined}
										/>
										<DeleteConfirmationDialog
											type="file"
											id={item.id}
											name={item.name}
											areaValue={areaValue}
											parentFolderId={item.folderId || undefined}
										/>
									</div>
								)}
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</CardContent>
		</Card>
	)
}
