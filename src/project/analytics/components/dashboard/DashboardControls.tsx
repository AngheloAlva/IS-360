"use client"

import { useState } from "react"
import { 
  Download, 
  Save, 
  FolderOpen, 
  PlusCircle
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { SaveDashboardDialog } from "./SaveDashboardDialog"
import { LoadDashboardDialog } from "./LoadDashboardDialog"

export function DashboardControls() {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)

  const handleExport = () => {
    // Implementar exportación en futuras iteraciones
    alert("Funcionalidad de exportación estará disponible en futuras actualizaciones")
  }

  const handleAddVisualization = () => {
    // Implementar añadir nueva visualización en futuras iteraciones
    alert("Funcionalidad de múltiples visualizaciones estará disponible en futuras actualizaciones")
  }

  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="h-4 w-4 mr-1" />
          Guardar
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLoadDialogOpen(true)}
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          Cargar
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleAddVisualization}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Nueva visualización
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-1" />
          Exportar
        </Button>
      </div>
      
      <SaveDashboardDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />
      
      <LoadDashboardDialog
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
      />
    </div>
  )
}
