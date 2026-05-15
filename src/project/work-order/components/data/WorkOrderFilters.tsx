import { WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { WorkOrderStatusOptions } from "@/lib/consts/work-order-status"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import {
	Select,
	SelectItem,
	SelectLabel,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectSeparator,
} from "@/shared/components/ui/select"
import { memo } from "react"

export const WorkOrderTypeFilter = memo(
	({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) => (
		<Select
			onValueChange={(value) => onChange(value === "all" ? null : value)}
			value={value ?? "all"}
		>
			<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors">
				<SelectValue placeholder="Todos los tipos" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Tipo de obra</SelectLabel>
					<SelectSeparator />
					<SelectItem value="all">Todos los tipos</SelectItem>
					{WorkOrderTypeOptions.map((type) => (
						<SelectItem key={type.value} value={type.value}>
							{type.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
)
WorkOrderTypeFilter.displayName = "TypeFilter"

export const WorkOrderCompanyFilter = memo(
	({
		value,
		onChange,
		companies,
	}: {
		value: string | null
		onChange: (value: string | null) => void
		companies: { id: string; name: string }[] | undefined
	}) => (
		<Select
			onValueChange={(value) => onChange(value === "all" ? null : value)}
			value={value ?? "all"}
		>
			<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors">
				<SelectValue placeholder="Todas las empresas" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Empresa</SelectLabel>
					<SelectSeparator />
					<SelectItem value="all">Todas las empresas</SelectItem>
					{companies?.map((company) => (
						<SelectItem key={company.id} value={company.id}>
							{company.name}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
)
WorkOrderCompanyFilter.displayName = "CompanyFilter"

export const WorkOrderStatusFilter = memo(
	({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) => (
		<Select
			onValueChange={(value) => onChange(value === "all" ? null : value)}
			value={value ?? "all"}
		>
			<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors">
				<SelectValue placeholder="Todos los estados" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Estado</SelectLabel>
					<SelectSeparator />
					<SelectItem value="all">Todos los estados</SelectItem>
					{WorkOrderStatusOptions.map((status) => (
						<SelectItem key={status.value} value={status.value}>
							{status.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
)
WorkOrderStatusFilter.displayName = "StatusFilter"

export const WorkOrderPriorityFilter = memo(
	({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) => (
		<Select
			onValueChange={(value) => onChange(value === "all" ? null : value)}
			value={value ?? "all"}
		>
			<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors">
				<SelectValue placeholder="Todas las prioridades" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Prioridad</SelectLabel>
					<SelectSeparator />
					<SelectItem value="all">Todas las prioridades</SelectItem>

					{WorkOrderPriorityOptions.map((priority) => (
						<SelectItem key={priority.value} value={priority.value}>
							{priority.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
)
WorkOrderPriorityFilter.displayName = "PriorityFilter"

export const WorkOrderHasRequestClousureFilter = memo(
	({ value, onChange }: { value: boolean | null; onChange: (value: boolean) => void }) => (
		<Select
			onValueChange={(value) => onChange(value === "true" ? true : false)}
			value={value ? "true" : "false"}
		>
			<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors">
				<SelectValue placeholder="Todos los hitos" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Hito(s) en Revisión</SelectLabel>
					<SelectSeparator />
					<SelectItem value="false">Todas las OT</SelectItem>
					<SelectItem value="true">Solo en Revisión</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	)
)
WorkOrderHasRequestClousureFilter.displayName = "HasRequestClousureFilter"
