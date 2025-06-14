import { SidebarTrigger } from "../ui/sidebar"
import { Separator } from "../ui/separator"
import PageName from "../sidebar/PageName"
import ThemeButton from "./ThemeButton"

import type { Session } from "@/lib/auth"

export default function Header({
	session,
}: Readonly<{
	session: Session
}>): React.ReactElement {
	return (
		<header className="border-input bg-background flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:px-8">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<PageName externalPath={session.user.accessRole === "PARTNER_COMPANY"} />
			</div>

			<div className="flex items-center gap-2">
				<ThemeButton />
			</div>
		</header>
	)
}
