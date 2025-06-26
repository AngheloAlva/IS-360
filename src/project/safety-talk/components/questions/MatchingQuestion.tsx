"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Question } from "../../utils/environmental-questions"

interface MatchingQuestionProps {
  question: Question
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function MatchingQuestion({
  question,
  value,
  onChange,
  disabled
}: MatchingQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>(() => {
    if (!value) return {}
    return Object.fromEntries(
      value.split(",").map(match => {
        const [left, right] = match.split("")
        return [left, right]
      })
    )
  })

  if (!question.matchingPairs) return null

  const handleMatch = (leftId: string, rightId: string) => {
    const newMatches = { ...matches, [leftId]: rightId }
    setMatches(newMatches)

    // Convert matches to the format "1B,2C,3D,4A"
    const matchString = Object.entries(newMatches)
      .map(([left, right]) => `${left}${right}`)
      .sort()
      .join(",")

    onChange(matchString)
  }

  const availableRightOptions = (leftId: string) => {
    const usedOptions = Object.values(matches)
    return question.matchingPairs?.map(pair => pair.right).filter(right => 
      !usedOptions.includes(right.id) || matches[leftId] === right.id
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-lg font-medium">{question.text}</p>
      <div className="grid gap-4">
        {question.matchingPairs.map(pair => (
          <div key={pair.left.id} className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
            <div className="rounded-lg border bg-card p-4">
              {pair.left.text}
            </div>
            <div className="text-center">→</div>
            <Select
              value={matches[pair.left.id] || ""}
              onValueChange={(rightId) => handleMatch(pair.left.id, rightId)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Seleccionar...</SelectItem>
                {availableRightOptions(pair.left.id)?.map(right => (
                  <SelectItem key={right.id} value={right.id}>
                    {right.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )
}
