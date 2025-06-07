import { AlertTriangle, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function getAlertIcon(type: "info" | "warning" | "urgent") {
  switch (type) {
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case "urgent":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

export function getAlertBadge(type: "info" | "warning" | "urgent") {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        type === "info" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        type === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        type === "urgent" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      )}
    >
      {type === "info" && "Info"}
      {type === "warning" && "Atención"}
      {type === "urgent" && "Urgente"}
    </div>
  )
}
