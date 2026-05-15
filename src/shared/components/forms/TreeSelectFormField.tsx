"use client"

import type { Control, FieldValues, Path } from "react-hook-form"

import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form"
import { TreeSelect, type TreeSelectNode } from "./TreeSelect"

// ─── Types ────────────────────────────────────────────────────────────────────

type BaseFieldProps<T extends FieldValues> = {
	name: Path<T>
	control: Control<T>
	label?: string
	optional?: boolean
	description?: string
	itemClassName?: string
	nodes: TreeSelectNode[]
	placeholder?: string
	disabled?: boolean
	className?: string
	isLoading?: boolean
}

type SingleFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
	mode?: "single"
}

type MultipleFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
	mode: "multiple"
}

export type TreeSelectFormFieldProps<T extends FieldValues> =
	| SingleFieldProps<T>
	| MultipleFieldProps<T>

// ─── Component ────────────────────────────────────────────────────────────────

export function TreeSelectFormField<T extends FieldValues>({
	name,
	control,
	label,
	optional,
	description,
	itemClassName,
	nodes,
	placeholder,
	disabled,
	className,
	isLoading,
	mode,
}: TreeSelectFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel className="gap-1">
						{label}
						{optional && <span className="text-muted-foreground"> (opcional)</span>}
					</FormLabel>
					<FormControl>
						{mode === "multiple" ? (
							<TreeSelect
								mode="multiple"
								nodes={nodes}
								placeholder={placeholder}
								disabled={disabled}
								className={className}
								isLoading={isLoading}
								value={(field.value as string[]) ?? []}
								onChange={field.onChange}
							/>
						) : (
							<TreeSelect
								mode="single"
								nodes={nodes}
								placeholder={placeholder}
								disabled={disabled}
								className={className}
								isLoading={isLoading}
								value={(field.value as string | null) ?? null}
								onChange={field.onChange}
							/>
						)}
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
