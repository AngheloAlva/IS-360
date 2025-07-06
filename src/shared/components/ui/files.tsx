"use client"

import { FileTypeIcon, FolderIcon, FolderOpenIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import * as React from "react"

import { MotionHighlight, MotionHighlightItem } from "@/shared/effects/motion-highlight"
import { cn } from "@/lib/utils"

import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	useAccordionItem,
	AccordionContent,
	AccordionItemProps,
	AccordionTriggerProps,
} from "./accordion"

type FileButtonProps = React.ComponentProps<"div"> & {
	icons?: {
		close: React.ReactNode
		open: React.ReactNode
	}
	icon?: React.ReactNode
	open?: boolean
	sideComponent?: React.ReactNode
}

function FileButton({
	children,
	className,
	icons,
	icon,
	open,
	sideComponent,
	...props
}: FileButtonProps) {
	return (
		<MotionHighlightItem className="size-full">
			<div
				data-slot="file-button"
				className={cn(
					"relative z-10 flex h-10 w-full cursor-default items-center gap-2 truncate rounded-lg p-2",
					className
				)}
				{...props}
			>
				<span className="flex shrink-1 items-center gap-2 truncate [&_svg]:size-4 [&_svg]:shrink-0">
					{icon
						? typeof icon !== "string"
							? icon
							: null
						: icons && (
								<AnimatePresence mode="wait">
									<motion.span
										key={open ? "open" : "close"}
										initial={{ scale: 0.9 }}
										animate={{ scale: 1 }}
										exit={{ scale: 0.9 }}
										transition={{ duration: 0.15 }}
									>
										{open
											? typeof icons.open !== "string"
												? icons.open
												: null
											: typeof icons.close !== "string"
												? icons.close
												: null}
									</motion.span>
								</AnimatePresence>
							)}
					<span className="block shrink-1 truncate text-sm break-words">{children}</span>
				</span>
				{sideComponent}
			</div>
		</MotionHighlightItem>
	)
}

type FilesProps = React.ComponentProps<"div"> & {
	children: React.ReactNode
	activeClassName?: string
	defaultOpen?: string[]
	open?: string[]
	onOpenChange?: (open: string[]) => void
}

function Files({
	children,
	className,
	activeClassName,
	defaultOpen,
	open,
	onOpenChange,
	...props
}: FilesProps) {
	return (
		<div data-slot="files" className={cn("relative size-full", className)} {...props}>
			<MotionHighlight
				controlledItems
				mode="parent"
				hover
				className={cn("bg-muted pointer-events-none rounded-lg", activeClassName)}
			>
				<Accordion
					type="multiple"
					defaultValue={defaultOpen}
					value={open}
					onValueChange={onOpenChange}
				>
					{children}
				</Accordion>
			</MotionHighlight>
		</div>
	)
}

type FolderTriggerProps = AccordionTriggerProps & {
	sideComponent?: React.ReactNode
}

function FolderTrigger({ children, className, sideComponent, ...props }: FolderTriggerProps) {
	const { isOpen } = useAccordionItem()

	return (
		<AccordionTrigger
			data-slot="folder-trigger"
			className="relative z-10 h-auto max-w-full py-0 font-normal hover:no-underline"
			{...props}
			chevron={false}
		>
			<FileButton
				open={isOpen}
				icons={{ open: <FolderOpenIcon />, close: <FolderIcon /> }}
				className={className}
				sideComponent={sideComponent}
			>
				{children}
			</FileButton>
		</AccordionTrigger>
	)
}

type FolderProps = Omit<
	AccordionItemProps,
	"value" | "onValueChange" | "defaultValue" | "children"
> & {
	children?: React.ReactNode
	name: string
	open?: string[]
	onOpenChange?: (open: string[]) => void
	defaultOpen?: string[]
	sideComponent?: React.ReactNode
}

function Folder({
	children,
	className,
	name,
	open,
	defaultOpen,
	onOpenChange,
	sideComponent,
	...props
}: FolderProps) {
	return (
		<AccordionItem data-slot="folder" value={name} className="relative border-b-0" {...props}>
			<FolderTrigger className={className} sideComponent={sideComponent}>
				{name}
			</FolderTrigger>
			{children && (
				<AccordionContent className="before:bg-border relative !ml-7 pb-0 before:absolute before:inset-y-0 before:-left-3 before:h-full before:w-px">
					<Accordion
						type="multiple"
						defaultValue={defaultOpen}
						value={open}
						onValueChange={onOpenChange}
					>
						{children}
					</Accordion>
				</AccordionContent>
			)}
		</AccordionItem>
	)
}

type FileProps = Omit<React.ComponentProps<"div">, "children"> & {
	name: string
	sideComponent?: React.ReactNode
}

function File({ name, className, sideComponent, ...props }: FileProps) {
	return (
		<FileButton
			data-slot="file"
			className={className}
			icon={<FileTypeIcon />}
			sideComponent={sideComponent}
			{...props}
		>
			{name}
		</FileButton>
	)
}

export { Files, Folder, File, type FilesProps, type FolderProps, type FileProps }
