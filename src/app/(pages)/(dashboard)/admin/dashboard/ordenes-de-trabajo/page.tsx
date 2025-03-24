import MainAdminWorkOrders from "@/components/sections/admin-work-orders/Main"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AdminUsersPage(props: {
	searchParams: SearchParams
}): Promise<React.ReactElement> {
	const searchParams = await props.searchParams
	const page = searchParams.page ? parseInt(searchParams.page as string) : 1

	return <MainAdminWorkOrders page={page} />
}
