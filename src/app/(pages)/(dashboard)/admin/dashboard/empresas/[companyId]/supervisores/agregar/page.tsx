import CreateExternalSupervisorsForm from "@/project/user/components/forms/CreateExternalSupervisorsForm"

export default async function CreateExternalUserPage({
	params,
}: {
	params: Promise<{ companyId: string }>
}) {
	const companyId = (await params).companyId

	return <CreateExternalSupervisorsForm companyId={companyId} />
}
