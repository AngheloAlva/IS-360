import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { InfoIcon } from "lucide-react"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import DeleteConfirmationDialog from "../forms/DeleteConfirmationDialog"
import UpdateFolderFormSheet from "../forms/UpdateFolderFormSheet"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"

import type { Folder } from "../../hooks/use-documents"
import type { AREAS } from "@prisma/client"

export default function FolderExplorerItem({
	item,
	icon,
	userId,
	canEdit,
	areaValue,
	foldersSlugs,
	actualFolderId,
	prefetchFolder,
}: {
	item: Folder
	userId: string
	areaValue: AREAS
	canEdit: boolean
	icon: React.ReactNode
	foldersSlugs: string[]
	actualFolderId: string | null
	prefetchFolder: (folderId: string | null) => void
}): React.ReactElement {
	return (
		<Card key={item.id} className="relative" onMouseEnter={() => prefetchFolder(item.id)}>
			<CardContent className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					{icon}
					<Link
						href={`/admin/dashboard/documentacion/${foldersSlugs.join("/")}/${item.slug + "_" + item.id}`}
						className="pr-12 font-medium hover:underline"
					>
						{item.name}
					</Link>
				</div>

				{item.description && (
					<p className="text-muted-foreground line-clamp-2 text-sm">{item.description}</p>
				)}

				<div className="mt-2 flex w-full items-center justify-end">
					<span
						className={cn(
							"w-fit rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500",
							{
								"bg-red-500/10 text-red-500":
									item._count.files === 0 && item._count.subFolders === 0,
							}
						)}
					>
						{item._count.files > 0 || item._count.subFolders > 0
							? "Si contiene información"
							: "No contiene información"}
					</span>
				</div>

				<div className="absolute top-4 right-4 flex gap-1">
					<Popover>
						<PopoverTrigger asChild>
							<Button size="icon" className="bg-primary/20 text-text hover:bg-primary h-8 w-8">
								<InfoIcon className="h-4 w-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-80">
							<div className="grid gap-2">
								<div className="space-y-1">
									<h4 className="font-medium">Información de la carpeta</h4>
									<p className="text-muted-foreground text-sm">
										Creado por: <span className="font-semibold">{item.user?.name}</span>
									</p>
									<p className="text-muted-foreground text-sm">
										Última actualización:{" "}
										<span className="font-semibold">
											{formatDistanceToNow(item.updatedAt, {
												addSuffix: true,
												locale: es,
											})}
										</span>
									</p>
								</div>

								{canEdit && (
									<div className="mt-4 flex gap-2">
										<UpdateFolderFormSheet userId={userId} oldFolder={item} />
										<DeleteConfirmationDialog
											id={item.id}
											type="folder"
											name={item.name}
											areaValue={areaValue}
											parentFolderId={actualFolderId}
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
