"use client"

import { PlayCircleIcon, TvMinimalPlayIcon } from "lucide-react"

import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface VideoTutorialsProps {
	videos: {
		title: string
		description: string
		url: string
	}[]
	className?: string
}

export default function VideoTutorials({
	videos,
	className,
}: VideoTutorialsProps): React.ReactElement {
	const [activeVideo, setActiveVideo] = useState<(typeof videos)[0] | null>(null)

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					className={cn(
						"cursor-pointer rounded-lg bg-white p-2 text-black transition-all hover:scale-105",
						className
					)}
				>
					<TvMinimalPlayIcon />
				</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuLabel>Videos tutoriales</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						{videos.map((video) => (
							<DropdownMenuItem
								key={video.url}
								className="cursor-pointer"
								onClick={() => setActiveVideo(video)}
							>
								{video.title}
								<PlayCircleIcon />
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Video tutorial</DialogTitle>
						<DialogDescription>{activeVideo?.description}</DialogDescription>
					</DialogHeader>

					<div className="aspect-video overflow-hidden rounded-md">
						<iframe
							allowFullScreen
							src={activeVideo?.url}
							className="h-full w-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						/>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
