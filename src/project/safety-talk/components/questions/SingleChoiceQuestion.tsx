"use client"

import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Label } from "@/shared/components/ui/label"
import { Question } from "../../utils/environmental-questions"

interface SingleChoiceQuestionProps {
  question: Question
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SingleChoiceQuestion({
  question,
  value,
  onChange,
  disabled
}: SingleChoiceQuestionProps) {
  if (!question.options) return null

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.text}</p>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-2"
      >
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={`q${question.id}-${option.id}`} />
            <Label htmlFor={`q${question.id}-${option.id}`} className="text-base">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
