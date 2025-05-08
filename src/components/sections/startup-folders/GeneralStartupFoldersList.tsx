"use client"

import { useCompanyGeneralStartupFolders } from "@/hooks/startup-folders/use-general-startup-folder"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Building2, Files, Info } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export function GeneralStartupFoldersList() {
  const { data: session } = authClient.useSession()
  const { data: folders, isLoading } = useCompanyGeneralStartupFolders()
  
  const isPartnerCompany = session?.user?.role === "PARTNER_COMPANY"

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (!folders || folders.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
        <Files className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">No hay carpetas de arranque generales</p>
          <p className="text-sm text-muted-foreground">
            {isPartnerCompany 
              ? "Contacta a OTC para obtener más información sobre tu carpeta de arranque general." 
              : "Las carpetas de arranque generales se crean automáticamente al crear una empresa contratista."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {folders.map((folder) => (
        <Card key={folder.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="line-clamp-1 text-lg">
                {folder.company.name}
              </CardTitle>
              <StartupFolderStatusBadge status={folder.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <Building2 className="mr-2 h-4 w-4" />
              <span>RUT: {folder.company.rut}</span>
            </div>
            <div className="mt-2 flex items-start gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Documentos</p>
                <p className="font-medium">{folder.documents?.length || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Última actualización</p>
                <p className="font-medium">
                  {format(new Date(folder.updatedAt), "dd MMM yyyy", { locale: es })}
                </p>
              </div>
            </div>
            {folder.reviewedAt && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>
                  Revisado por {folder.reviewer?.name || "OTC"} el{" "}
                  {format(new Date(folder.reviewedAt), "dd MMM yyyy", { locale: es })}
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/dashboard/carpetas-de-arranque/general/${folder.id}`}>
                Ver carpeta
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
