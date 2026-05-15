"use client"

import { Trash2Icon } from "lucide-react"

import { PeligrosOptions, PELIGRO_OTRA_ID } from "@/lib/consts/peligros"
import { RiesgosOptions, RIESGO_OTRA_ID } from "@/lib/consts/riesgos"
import { MedidasDeControlOptions, MEDIDA_OTRA_ID } from "@/lib/consts/medidas-de-control"

import { MultiSelectFormField } from "@/shared/components/forms/MultiSelectFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { Button } from "@/shared/components/ui/button"

import type { WorkPermitSchema } from "@/project/work-permit/schemas/work-permit.schema"
import type { Control, UseFormWatch } from "react-hook-form"

interface ActivityRowProps {
	index: number
	onRemove: () => void
	canRemove: boolean
	control: Control<WorkPermitSchema>
	watch: UseFormWatch<WorkPermitSchema>
}

export function ActivityRow({ index, onRemove, canRemove, control, watch }: ActivityRowProps) {
	const peligros = watch(`activityDetails.${index}.peligros`) ?? []
	const riesgos = watch(`activityDetails.${index}.riesgos`) ?? []
	const medidasDeControl = watch(`activityDetails.${index}.medidasDeControl`) ?? []

	return (
		<div className="border-border grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-start gap-3 border-b px-3 py-4 last:border-b-0">
			<div className="flex flex-col gap-2">
				<InputFormField<WorkPermitSchema>
					label={`Actividad ${index + 1}`}
					control={control}
					placeholder="Describa la actividad"
					name={`activityDetails.${index}.activity`}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<MultiSelectFormField<WorkPermitSchema>
					label="Peligros"
					control={control}
					options={PeligrosOptions}
					name={`activityDetails.${index}.peligros`}
				/>

				{peligros.includes(PELIGRO_OTRA_ID) && (
					<InputFormField<WorkPermitSchema>
						label="Especifique"
						control={control}
						name={`activityDetails.${index}.otroPeligro`}
					/>
				)}
			</div>

			<div className="flex flex-col gap-2">
				<MultiSelectFormField<WorkPermitSchema>
					label="Riesgos"
					control={control}
					options={RiesgosOptions}
					name={`activityDetails.${index}.riesgos`}
				/>

				{riesgos.includes(RIESGO_OTRA_ID) && (
					<InputFormField<WorkPermitSchema>
						label="Especifique"
						control={control}
						name={`activityDetails.${index}.otroRiesgo`}
					/>
				)}
			</div>

			<div className="flex flex-col gap-2">
				<MultiSelectFormField<WorkPermitSchema>
					label="Medidas de control"
					control={control}
					options={MedidasDeControlOptions}
					groupBy="group"
					name={`activityDetails.${index}.medidasDeControl`}
				/>

				{medidasDeControl.includes(MEDIDA_OTRA_ID) && (
					<InputFormField<WorkPermitSchema>
						label="Especifique"
						control={control}
						name={`activityDetails.${index}.otraMedidaDeControl`}
					/>
				)}
			</div>

			<div className="pt-7">
				{canRemove && (
					<Button
						size="icon"
						type="button"
						variant="ghost"
						className="hover:bg-rose-100 hover:text-rose-700"
						onClick={onRemove}
					>
						<Trash2Icon className="size-4" />
					</Button>
				)}
			</div>
		</div>
	)
}
