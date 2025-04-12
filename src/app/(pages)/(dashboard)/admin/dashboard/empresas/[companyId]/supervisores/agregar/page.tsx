import CreateExternalSupervisorsForm from "@/components/forms/admin/user/CreateExternalSupervisorsForm"

export default async function CreateExternalUserPage({
	params,
}: {
	params: Promise<{ companyId: string }>
}) {
	const companyId = (await params).companyId

	return <CreateExternalSupervisorsForm companyId={companyId} />
}
