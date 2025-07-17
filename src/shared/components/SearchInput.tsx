"use client"

import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

import { Input } from "./ui/input"

interface SearchInputProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	inputClassName?: string
	iconClassName?: string
	setPage: (page: number) => void
}

export default function SearchInput({
	value,
	setPage,
	onChange,
	className,
	inputClassName,
	placeholder = "Buscar...",
	iconClassName,
}: SearchInputProps) {
	return (
		<div className={cn("relative", className)}>
			<Search
				className={cn(
					"text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2",
					iconClassName
				)}
			/>
			<Input
				value={value}
				placeholder={placeholder}
				className={cn("pl-8", inputClassName)}
				onChange={(e) => {
					onChange(e.target.value)
					setPage(1)
				}}
			/>
		</div>
	)
}
