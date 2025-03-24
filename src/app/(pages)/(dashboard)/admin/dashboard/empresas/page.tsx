import MainAdminCompanies from "@/components/sections/admin/companies/Main"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AdminCompaniesPage(props: {
	searchParams: SearchParams
}): Promise<React.ReactElement> {
	const searchParams = await props.searchParams
	const page = searchParams.page ? parseInt(searchParams.page as string) : 1

	return <MainAdminCompanies page={page} />
}
