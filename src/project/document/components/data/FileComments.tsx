import { MessageSquareText } from "lucide-react"
import { format } from "date-fns"

import NewCommentFormSheet from "@/project/document/components/forms/NewCommentFormSheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Button } from "@/shared/components/ui/button"

import type { FileComment } from "@prisma/client"

export default function FileComments({
	fileId,
	comments,
	userId,
}: {
	fileId: string
	comments: Array<FileComment & { user: { name: string } }>
	userId: string
}): React.ReactElement {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button size="icon" className="bg-primary/20 text-text hover:bg-primary h-8 w-8">
					<MessageSquareText className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="flex w-80 flex-col gap-2">
				<div className="grid gap-2">
					{comments.length > 0 ? (
						<div className="divide-y">
							{comments.map((comment) => (
								<div key={comment.id} className="flex flex-col items-start py-1">
									<p className="flex w-full items-center justify-between">
										<span className="text-muted-foreground text-xs">{comment.user.name}</span>
										<span className="text-muted-foreground text-xs">
											{format(comment.createdAt, "dd/MM/yyyy")}
										</span>
									</p>
									<p className="text-muted-foreground line-clamp-2 text-sm">{comment.content}</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-sm">No hay comentarios</p>
					)}
				</div>

				<NewCommentFormSheet fileId={fileId} userId={userId} />
			</PopoverContent>
		</Popover>
	)
}
