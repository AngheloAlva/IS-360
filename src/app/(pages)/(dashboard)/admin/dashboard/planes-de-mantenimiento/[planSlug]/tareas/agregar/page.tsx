import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import NewMaintenancePlanTaskForm from "@/components/forms/maintenance-plan/NewMaintenancePlanTaskForm"
import BackButton from "@/components/shared/BackButton"

interface Props {
  params: Promise<{ planSlug: string }>
}

export default async function CreateMaintenancePlanTaskPage({ params }: Props) {
  const { planSlug } = await params

  const data = await auth.api.getSession({
    headers: await headers(),
  })

  if (!data || !data?.user) {
    return notFound()
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
        <BackButton href={`/admin/dashboard/planes-de-mantenimiento/${planSlug}/tareas`} />
        <h1 className="w-fit text-3xl font-bold">Nueva Tarea para: {planSlug.replaceAll("-", " ")}</h1>
      </div>

      <NewMaintenancePlanTaskForm userId={data.user.id} maintenancePlanSlug={planSlug} />
    </>
  )
}
