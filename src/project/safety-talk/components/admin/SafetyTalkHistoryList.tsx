"use client"

import { useState, useEffect } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"

import { formatDate } from "@/lib/utils"
import { getSafetyTalkHistory } from "@/project/safety-talk/actions/get-safety-talk-history"

import { type SAFETY_TALK_CATEGORY, type SAFETY_TALK_STATUS } from "@prisma/client"

interface SafetyTalkHistory {
  id: string
  category: SAFETY_TALK_CATEGORY
  status: SAFETY_TALK_STATUS
  score: number | null
  completedAt: Date | null
  user: {
    name: string
    email: string
  }
  approvalBy: {
    name: string
  } | null
}

export function SafetyTalkHistoryList() {
  const [history, setHistory] = useState<SafetyTalkHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await getSafetyTalkHistory()
        setHistory(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-muted-foreground">Cargando historial...</p>
      ) : history.length === 0 ? (
        <p className="text-muted-foreground">No hay registros en el historial.</p>
      ) : (
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Puntaje</TableHead>
            <TableHead>Fecha Completado</TableHead>
            <TableHead>Aprobado Por</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((talk) => (
            <TableRow key={talk.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{talk.user.name}</p>
                  <p className="text-sm text-muted-foreground">{talk.user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{talk.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge>{talk.status}</Badge>
              </TableCell>
              <TableCell>{talk.score}%</TableCell>
              <TableCell>{formatDate(talk.completedAt)}</TableCell>
              <TableCell>{talk.approvalBy?.name || "-"}</TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
    </div>
  )
}
