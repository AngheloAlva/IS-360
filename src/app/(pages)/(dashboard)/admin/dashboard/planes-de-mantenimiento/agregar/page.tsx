import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import NewMaintenancePlanForm from "@/components/forms/maintenance-plan/NewMaintenancePlanForm"
import BackButton from "@/components/shared/BackButton"

export default async function CreateMaintenancePlanPage() {
  const data = await auth.api.getSession({
    headers: await headers(),
  })

  if (!data || !data?.user) {
    return notFound()
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
        <BackButton href="/admin/dashboard/planes-de-mantenimiento" />
        <h1 className="w-fit text-3xl font-bold">Nuevo Plan de Mantenimiento</h1>
      </div>

      <NewMaintenancePlanForm userId={data.user.id} />
    </>
  )
}
