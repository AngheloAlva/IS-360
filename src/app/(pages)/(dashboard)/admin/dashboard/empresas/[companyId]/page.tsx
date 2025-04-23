import { Plus } from "lucide-react";
import Link from "next/link";

import { VehiclesByCompanyDataTable } from "@/components/sections/admin/companies/vehicles/VehiclesByCompanyDataTable";
import { UsersByCompanyDataTable } from "@/components/sections/users/UsersByCompanyDataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";

export default async function CompanyByIdAdminPage({ params }: { params: Promise<{ companyId: string }> }): Promise<React.ReactElement> {
  const companyId = (await params).companyId;

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="users" className="w-full flex flex-col gap-2">
        <div className="flex items-center gap-2 w-full">
          <BackButton href="/admin/dashboard/empresas" />
          <h1 className="text-2xl font-bold">Usuarios y Vehículos de la empresa</h1>

          <Link href={`/admin/dashboard/empresas/${companyId}/supervisores/agregar`} className="ml-auto">
            <Button
              variant={"outline"}
              className="border-green-500 bg-green-600 tracking-wider text-white hover:text-white hover:bg-green-800 "
            >
              <Plus className="mr-2 h-4 w-4" /> Supervisor(es)
            </Button>
          </Link>
        </div>


        <TabsList className="w-full h-12 mt-6">
          <TabsTrigger className="h-10" value="users">Colaboradores</TabsTrigger>
          <TabsTrigger className="h-10" value="vehicles">Vehículos</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersByCompanyDataTable companyId={companyId} />
        </TabsContent>

        <TabsContent value="vehicles">
          <VehiclesByCompanyDataTable companyId={companyId} />
        </TabsContent>


      </Tabs>
    </div>
  )
}
