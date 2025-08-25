"use client"

import { useState, KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form"

import type { Control, FieldValues, Path } from "react-hook-form"

interface EmailTagsInputFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	control: Control<T>
	optional?: boolean
	disabled?: boolean
	placeholder?: string
	description?: string
	className?: React.ComponentProps<"div">["className"]
	itemClassName?: React.ComponentProps<"div">["className"]
}

const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email.trim())
}

export function EmailTagsInputFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	placeholder,
	description,
	itemClassName,
	disabled = false,
	optional = false,
}: EmailTagsInputFormFieldProps<T>) {
	const [inputValue, setInputValue] = useState("")

	const addEmail = (
		email: string,
		currentEmails: string[],
		onChange: (emails: string[]) => void
	) => {
		const trimmedEmail = email.trim()
		if (trimmedEmail && isValidEmail(trimmedEmail) && !currentEmails.includes(trimmedEmail)) {
			onChange([...currentEmails, trimmedEmail])
		}
		setInputValue("")
	}

	const removeEmail = (
		emailToRemove: string,
		currentEmails: string[],
		onChange: (emails: string[]) => void
	) => {
		onChange(currentEmails.filter((email) => email !== emailToRemove))
	}

	const handleKeyDown = (
		e: KeyboardEvent<HTMLInputElement>,
		currentEmails: string[],
		onChange: (emails: string[]) => void
	) => {
		if (e.key === "Enter" || e.key === " " || e.key === ",") {
			e.preventDefault()
			addEmail(inputValue, currentEmails, onChange)
		} else if (e.key === "Backspace" && !inputValue && currentEmails.length > 0) {
			removeEmail(currentEmails[currentEmails.length - 1], currentEmails, onChange)
		}
	}

	const handleBlur = (currentEmails: string[], onChange: (emails: string[]) => void) => {
		if (inputValue) {
			addEmail(inputValue, currentEmails, onChange)
		}
	}

	const handlePaste = (
		e: React.ClipboardEvent<HTMLInputElement>,
		currentEmails: string[],
		onChange: (emails: string[]) => void
	) => {
		e.preventDefault()
		const pastedText = e.clipboardData.getData("text")
		const emails = pastedText.split(/[,;\s]+/).filter((email) => email.trim())

		const validEmails = emails.filter((email) => isValidEmail(email.trim()))
		const uniqueEmails = validEmails.filter((email) => !currentEmails.includes(email.trim()))

		if (uniqueEmails.length > 0) {
			onChange([...currentEmails, ...uniqueEmails.map((email) => email.trim())])
		}
		setInputValue("")
	}

	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => {
				const currentEmails = field.value || []

				return (
					<FormItem className={cn("content-start", itemClassName)}>
						<FormLabel className="gap-1">
							{label}
							{optional && <span className="text-muted-foreground"> (opcional)</span>}
						</FormLabel>
						<FormControl>
							<div
								className={cn(
									"border-input bg-background ring-offset-background focus-within:ring-ring min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2",
									className
								)}
							>
								<div className="mb-1 flex flex-wrap gap-1">
									{currentEmails.map((email: string, index: number) => (
										<Badge
											key={index}
											variant="secondary"
											className="flex items-center gap-1 px-2 py-1 text-xs"
										>
											{email}
											<button
												type="button"
												disabled={disabled}
												onClick={() => removeEmail(email, currentEmails, field.onChange)}
												className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))}
								</div>
								<Input
									value={inputValue}
									disabled={disabled}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={(e) => handleKeyDown(e, currentEmails, field.onChange)}
									onBlur={() => handleBlur(currentEmails, field.onChange)}
									onPaste={(e) => handlePaste(e, currentEmails, field.onChange)}
									placeholder={
										currentEmails.length === 0
											? placeholder || "Ingresa emails separados por comas, espacios o Enter"
											: ""
									}
									className="border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
								/>
							</div>
						</FormControl>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				)
			}}
		/>
	)
}
